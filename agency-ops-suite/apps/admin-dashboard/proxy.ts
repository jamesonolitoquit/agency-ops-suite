export { proxy } from "./src/proxy";

export const config = {
  matcher: [
    // Run middleware on all paths except:
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
