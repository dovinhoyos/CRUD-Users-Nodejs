import type { IncomingMessage } from "http";
import { StringDecoder } from "string_decoder";

export const parseBody = (req: IncomingMessage): Promise<any> => {
  return new Promise((res, rej) => {
    const decoder = new StringDecoder("utf8");
    let buffer = "";

    req.on("data", (chunk) => {
      buffer += decoder.write(chunk);
    });

    req.on("end", () => {
      buffer += decoder.end();

      try {
        res(JSON.parse(buffer));
      } catch (err) {
        rej(err);
      }
    });
  });
};
