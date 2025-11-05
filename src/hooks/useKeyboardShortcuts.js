import { useEffect } from 'react';

const useKeyboardShortcuts = (shortcuts) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            for (const [keyCombo, action] of Object.entries(shortcuts)) {
                const keys = keyCombo.split('+');
                let match = true;

                for (const key of keys) {
                    if (key === 'ctrl' && !event.ctrlKey) match = false;
                    else if (key === 'shift' && !event.shiftKey) match = false;
                    else if (key === 'alt' && !event.altKey) match = false;
                    else if (key === 'escape' && event.key !== 'Escape') match = false;
                    else if (!['ctrl', 'shift', 'alt', 'escape'].includes(key) && event.key.toLowerCase() !== key.toLowerCase()) match = false;
                }

                if (match) {
                    event.preventDefault();
                    action();
                    break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
};

export default useKeyboardShortcuts;