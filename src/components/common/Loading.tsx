import React from 'react';
import './Loading.css';

interface LoadingProps {
    size?: 'small' | 'medium' | 'large';
    fullScreen?: boolean;
    message?: string;
}

export const Loading: React.FC<LoadingProps> = ({
                                                    size = 'medium',
                                                    fullScreen = false,
                                                    message,
                                                }) => {
    const spinner = (
        <div className={`loading-spinner loading-spinner-${size}`}>
            <div className="spinner"></div>
            {message && <p className="loading-message">{message}</p>}
        </div>
    );

    if (fullScreen) {
        return <div className="loading-fullscreen">{spinner}</div>;
    }

    return spinner;
};