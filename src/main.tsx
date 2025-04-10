import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "./redux/store.ts";
import { ConfigProvider } from 'antd';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GoogleOAuthProvider } from '@react-oauth/google';
import viVN from 'antd/locale/vi_VN';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <QueryClientProvider client={new QueryClient()}>
      <ConfigProvider locale={viVN}>
        <GoogleOAuthProvider clientId="283298846760-skcut0odghts4dpnsqv160nvlg87m4v7.apps.googleusercontent.com">
          <App />
        </GoogleOAuthProvider>
      </ConfigProvider>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  </Provider>
);
