import { QueryClient, QueryClientProvider } from "react-query";
import { AuthProvider } from "@/auth/providers/JWTProvider";
import {
  LayoutProvider,
  LoadersProvider,
  MenusProvider,
  SettingsProvider,
  SnackbarProvider,
  TranslationProvider,
  PermissionsProvider,
} from "@/providers";
import { HelmetProvider } from "react-helmet-async";
import { Svgifier } from "@sumcode/svgify";
import "@sumcode/svgify/styles";

const queryClient = new QueryClient();
const ProvidersWrapper = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Svgifier
        version={1}
        base_path="/superadmin/assets/icons"
        clearForOldVersion
      >
        <SnackbarProvider>
          <AuthProvider>
            <SettingsProvider>
              <TranslationProvider>
                <HelmetProvider>
                  <LayoutProvider>
                    <LoadersProvider>
                      <PermissionsProvider>
                        <MenusProvider>{children}</MenusProvider>
                      </PermissionsProvider>
                    </LoadersProvider>
                  </LayoutProvider>
                </HelmetProvider>
              </TranslationProvider>
            </SettingsProvider>
          </AuthProvider>
        </SnackbarProvider>
      </Svgifier>
    </QueryClientProvider>
  );
};
export { ProvidersWrapper };
