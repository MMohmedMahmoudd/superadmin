// Comprehensive suppression of ReactQuill deprecation warnings and forwardRef warnings
// MUST run before ANY other code, especially before React/React DevTools loads
(function() {
  if (typeof window === 'undefined') return;

  // Create a more comprehensive warning filter
  const shouldSuppressWarning = (message) => {
    if (!message) return false;
    const msgStr = String(message);
    const warningPatterns = [
      'DOMNodeInserted',
      'mutation event',
      'Listener added for a',
      'Deprecation',
      'Support for this event type has been removed',
      'findDOMNode is deprecated',
      'add a ref directly to the element',
      'ReactQuill',
      'findDOMNode',
      'Warning: findDOMNode',
      'react-quill',
      'Component Stack',
      'overrideMethod',
      'Security Headers Warning',
      'forwardRef',
      'forwardRef render functions',
      'forwardRef render functions accept',
      'Did you forget to use the ref parameter',
      'accept exactly two parameters',
      'exactly two parameters: props and ref',
      'Response is missing recommended security headers',
      'proxy.js',
      'disconnected port',
      'Attempting to use a disconnected port'
    ];
    
    return warningPatterns.some(pattern => msgStr.includes(pattern));
  };

  // Override console methods IMMEDIATELY, before anything else
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalLog = console.log;
  
  console.warn = function(...args) {
    if (args.length > 0 && shouldSuppressWarning(args[0])) {
      return; // Suppress warnings
    }
    return originalWarn.apply(console, args);
  };

  console.error = function(...args) {
    if (args.length > 0 && shouldSuppressWarning(args[0])) {
      return; // Suppress errors matching patterns
    }
    return originalError.apply(console, args);
  };

  console.log = function(...args) {
    if (args.length > 0 && shouldSuppressWarning(args[0])) {
      return; // Suppress logs matching patterns
    }
    return originalLog.apply(console, args);
  };

  // Intercept React DevTools hook if it exists or will exist
  const setupReactDevToolsInterception = () => {
    if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) return;
    
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    
    // Most importantly: Override overrideMethod to intercept console.warn
    if (hook.overrideMethod && !hook._overrideMethodWrapped) {
      hook._overrideMethodWrapped = true;
      const originalOverrideMethod = hook.overrideMethod;
      hook.overrideMethod = function(methodName, originalFn) {
        const result = originalOverrideMethod.apply(this, arguments);
        
        // If React DevTools is trying to override console.warn, wrap it
        if (methodName === 'console.warn' || methodName === 'warn') {
          return function(...args) {
            if (args.length > 0 && shouldSuppressWarning(args[0])) {
              return;
            }
            if (typeof result === 'function') {
              return result.apply(this, args);
            }
            if (typeof originalFn === 'function') {
              return originalFn.apply(console, args);
            }
            return originalWarn.apply(console, args);
          };
        }
        
        return result;
      };
    }

    // Override emit to catch warning events
    if (hook.emit && !hook._emitWrapped) {
      hook._emitWrapped = true;
      const originalEmit = hook.emit;
      hook.emit = function(event, ...args) {
        if (args.length > 0 && shouldSuppressWarning(args[0])) {
          return;
        }
        return originalEmit.apply(this, arguments);
      };
    }

    // Override onCommitFiberRoot to intercept warnings
    if (hook.onCommitFiberRoot && !hook._onCommitFiberRootWrapped) {
      hook._onCommitFiberRootWrapped = true;
      const originalOnCommitFiberRoot = hook.onCommitFiberRoot;
      hook.onCommitFiberRoot = function(...args) {
        try {
          return originalOnCommitFiberRoot.apply(this, args);
        } catch (e) {
          if (shouldSuppressWarning(e?.message)) return;
          throw e;
        }
      };
    }
  };

  // Try to set up interception multiple times
  setupReactDevToolsInterception();
  
  // Use Proxy to intercept when React DevTools hook is created
  try {
    if (!window._REACT_DEVTOOLS_HOOK_PROXY) {
      window._REACT_DEVTOOLS_HOOK_PROXY = true;
      let currentHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      
      Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
        get: function() {
          return currentHook;
        },
        set: function(value) {
          currentHook = value;
          setTimeout(setupReactDevToolsInterception, 0);
          setupReactDevToolsInterception();
        },
        configurable: true
      });
    }
  } catch {
    // Ignore if we can't set up the proxy
  }

  // Also try after various events
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupReactDevToolsInterception);
  }
  window.addEventListener('load', setupReactDevToolsInterception);
  
  // Try multiple times with delays
  setTimeout(setupReactDevToolsInterception, 0);
  setTimeout(setupReactDevToolsInterception, 10);
  setTimeout(setupReactDevToolsInterception, 50);
  setTimeout(setupReactDevToolsInterception, 100);
  setTimeout(setupReactDevToolsInterception, 500);

  // Override React's internal warning system if React is already loaded
  const overrideReactWarnings = () => {
    if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
      const internals = window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      
      // Override shared warning methods
      if (internals.ReactDebugCurrentFrame) {
        const originalWarn = internals.ReactDebugCurrentFrame.warn;
        if (originalWarn && !internals.ReactDebugCurrentFrame._warnWrapped) {
          internals.ReactDebugCurrentFrame._warnWrapped = true;
          internals.ReactDebugCurrentFrame.warn = function(message, ...args) {
            if (typeof message === 'string' && shouldSuppressWarning(message)) {
              return;
            }
            return originalWarn.call(this, message, ...args);
          };
        }
      }
    }
  };

  overrideReactWarnings();
  window.addEventListener('load', overrideReactWarnings);

  // Override addEventListener to suppress DOMNodeInserted event listeners
  if (!Element.prototype._addEventListenerWrapped) {
    Element.prototype._addEventListenerWrapped = true;
    const originalAddEventListener = Element.prototype.addEventListener;
    Element.prototype.addEventListener = function(type, listener, options) {
      if (type === 'DOMNodeInserted' || type === 'DOMNodeRemoved') {
        return;
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  // Also override document.addEventListener
  if (!document._addEventListenerWrapped) {
    document._addEventListenerWrapped = true;
    const originalDocAddEventListener = document.addEventListener;
    document.addEventListener = function(type, listener, options) {
      if (type === 'DOMNodeInserted' || type === 'DOMNodeRemoved') {
        return;
      }
      return originalDocAddEventListener.call(this, type, listener, options);
    };
  }
})();

import '@/components/keenicons/assets/duotone/style.css';
import '@/components/keenicons/assets/outline/style.css';
import '@/components/keenicons/assets/filled/style.css';
import '@/components/keenicons/assets/solid/style.css';
import './css/styles.css';
import axios from 'axios';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { setupAxios } from './auth';
import { ProvidersWrapper } from './providers';
import React from 'react';
import 'flowbite';

/**
 * Inject interceptors for axios.
 *
 * @see https://github.com/axios/axios#interceptors
 */
setupAxios(axios);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode>
    <ProvidersWrapper>
      <App />
    </ProvidersWrapper>
  </React.StrictMode>);
