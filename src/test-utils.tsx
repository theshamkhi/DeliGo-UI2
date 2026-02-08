import React, { PropsWithChildren } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './store/slices/authSlice';
import colisReducer from './store/slices/colisSlice';
import type { RootState } from './store';

// Create the root reducer
const rootReducer = combineReducers({
    auth: authReducer,
    colis: colisReducer,
});

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
    preloadedState?: Partial<RootState>;
    store?: any;
}

/**
 * Custom render function that wraps components with Redux Provider and Router
 * Usage: renderWithProviders(<MyComponent />)
 */
export function renderWithProviders(
    ui: React.ReactElement,
    {
        preloadedState,
        store = configureStore({
            reducer: rootReducer,
            preloadedState: preloadedState as any,
        }),
        ...renderOptions
    }: ExtendedRenderOptions = {}
) {
    function Wrapper({ children }: PropsWithChildren<{}>): React.ReactElement {
        return (
            <Provider store={store}>
                <BrowserRouter>
                    {children}
                </BrowserRouter>
            </Provider>
        );
    }

    return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

/**
 * Create a mock store with custom initial state
 */
export function createMockStore(preloadedState?: Partial<RootState>) {
    return configureStore({
        reducer: rootReducer,
        preloadedState: preloadedState as any,
    });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { renderWithProviders as render };