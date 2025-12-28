import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '@/auth/providers/JWTProvider';
import { LayoutProvider, LoadersProvider, MenusProvider, SettingsProvider, SnackbarProvider, TranslationProvider, PermissionsProvider } from '@/providers';
import { HelmetProvider } from 'react-helmet-async';
const queryClient = new QueryClient();
const ProvidersWrapper = ({
  children
}) => {
  return <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <AuthProvider>
          <SettingsProvider>
            <TranslationProvider>
              <HelmetProvider>
                <LayoutProvider>
                  <LoadersProvider>
                    <PermissionsProvider>
                      <MenusProvider>
                        {children}
                      </MenusProvider>
                    </PermissionsProvider>
                  </LoadersProvider>
                </LayoutProvider>
              </HelmetProvider>
            </TranslationProvider>
          </SettingsProvider>
        </AuthProvider>
      </SnackbarProvider>
    </QueryClientProvider>;
};
export { ProvidersWrapper };