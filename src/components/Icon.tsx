import React from 'react';

interface IconProps {
    name: string;
    size?: number | string;
    className?: string;
    style?: React.CSSProperties;
}

export const Icon: React.FC<IconProps> = ({
    name,
    size = '1em',
    className = '',
    style = {}
}) => {
    return (
        <i
            className={`bi bi-${name} ${className}`}
            style={{
                fontSize: size,
                ...style
            }}
        />
    );
};

export default Icon; 