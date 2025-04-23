export const config = {
  jwtSecret: (process.env.JWT_SECRET as string) || "My_Secret_Key",
  port: (process.env.PORT as string) || "3000",
};

export default config;
