import "next";

interface AuthAccess {
  role: string;
  unauthorized: string;
}

declare module "next" {
  interface NextPage {
    auth?: AuthAccess | boolean;
  }
}

// Ou, se estiver usando _app.tsx para gerenciamento global de autenticação
declare module "next/app" {
  interface AppProps {
    Component: NextPage;
    pageProps: {
      session: any;
      pageProps: any;
    };
  }
}