// hooks/useDebugSelector.js
import { useSelector } from 'react-redux';

export const useDebugSelector = (selector, componentName = 'Unknown') => {
    console.log(`🔍 useDebugSelector llamado en: ${componentName}`);

    if (!selector) {
        console.error(`❌ ERROR en ${componentName}: selector es undefined/null`);
        return null;
    }

    if (typeof selector !== 'function') {
        console.error(`❌ ERROR en ${componentName}: selector no es una función, es: ${typeof selector}`);
        return null;
    }

    try {
        const result = useSelector(selector);
        console.log(`✅ SUCCESS en ${componentName}:`, result);
        return result;
    } catch (error) {
        console.error(`❌ ERROR en ${componentName}:`, error);
        return null;
    }
};

// Hook seguro para usar temporalmente
export const useSafeSelector = (selector, fallback = null) => {
    try {
        if (typeof selector !== 'function') {
            console.warn('useSafeSelector: selector debe ser una función');
            return fallback;
        }
        return useSelector(selector);
    } catch (error) {
        console.error('Error en selector:', error);
        return fallback;
    }
};