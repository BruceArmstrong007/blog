import { authActions } from './../../../../stores/auth/auth.action';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  setLoaded,
  setLoading,
  withCallState,
} from '../../../../shared/component-store-features/api-call.feature';
import { catchError, of, switchMap, tap } from 'rxjs';
import { inject } from '@angular/core';
import { ApiService } from '../../../../shared/services/api/api.service';
import { API } from '../../../../shared/utils/api.endpoints';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { ClientRoutes } from '../../../../shared/utils/client.routes';
import { AccessToken, Login } from '../../../../stores/auth/auth.model';
import { generateAlertID } from '../../../../shared/utils/variables';
import { alertActions } from '../../../../stores/alert/alert.action';

export const LoginStore = signalStore(
  { providedIn: 'root' },
  withState({
    passwordVisibility: false,
  }),
  withCallState(),
  withMethods((state) => {
    const apiService = inject(ApiService);
    const store = inject(Store);
    const router = inject(Router);
    return {
      togglePassword: () =>
        patchState(state, {
          passwordVisibility: !state.passwordVisibility(),
        }),
      login: rxMethod<Login>((c$) =>
        c$.pipe(
          tap(() => {
            patchState(state, setLoading());
          }),
          switchMap((c) =>
            apiService.request(API.LOGIN, c).pipe(
              tap((response: any) => {
                patchState(state, setLoaded());
                const token: AccessToken = {
                  accessToken: response?.accessToken,
                };
                localStorage.setItem('isLoggedIn', 'true');
                store.dispatch(authActions.setToken(token));
                router.navigateByUrl(ClientRoutes.User.Root);
                store.dispatch(
                  alertActions.addAlert({
                    alert: {
                      type: 'SUCCESS',
                      message: response?.message ?? 'Successfully logged in!.',
                      id: generateAlertID(),
                      title: 'Login Successful',
                    },
                  })
                );
              }),
              catchError((error) => {
                let errorMsg = error?.error?.message ?? error?.statusText ?? error?.message;
                state.setError(errorMsg);
                return of(errorMsg);
              })
            )
          )
        )
      ),
    };
  })
);
