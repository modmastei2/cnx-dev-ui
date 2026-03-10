import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import React, { useCallback, useEffect, useRef } from 'react';
import { ValueChangedEvent } from '../cnx-value-changed.types';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';

export interface CnxTextBoxProps {
    id?: string;
    name?: string;
    placeholder?: string;
    value?: string;
    disabled?: boolean;
    maxLength?: number;
    showClearButton?: boolean;
    onValueChanged?: (e: ValueChangedEvent) => void;
    onEnterKey?: () => void;
}

export const CnxTextBox: React.FC<CnxTextBoxProps> = ({
    id,
    name,
    placeholder = 'Please key...',
    value,
    disabled = false,
    maxLength,
    showClearButton = true,
    onValueChanged,
    onEnterKey,
}) => {
    const valueRef = useRef(value);
    const onValueChangedRef = useRef(onValueChanged);
    const onEnterKeyRef = useRef(onEnterKey);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    useEffect(() => {
        onValueChangedRef.current = onValueChanged;
    }, [onValueChanged]);

    useEffect(() => {
        onEnterKeyRef.current = onEnterKey;
    }, [onEnterKey]);

    const handleChange = (newValue: any) => {
        const oldValue = valueRef.current;

        if (oldValue === newValue) return;

        onValueChangedRef.current?.({
            previousValue: oldValue,
            value: newValue,
        });
    };

    const renderClearIcon = useCallback(
        () =>
            showClearButton && value ? (
                <IconButton
                    size="small"
                    sx={{ mr: -1 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleChange(null);
                    }}
                >
                    <ClearIcon titleAccess="Clear" fontSize="small" />
                </IconButton>
            ) : null,
        [showClearButton, value, handleChange],
    );

    const displayValue = React.useMemo(() => {
        if (!value) return '';
        return maxLength !== undefined
            ? String(value).slice(0, maxLength)
            : String(value);
    }, [value, maxLength]);

    return (
        <FormControl fullWidth size="small">
            <TextField
                id={`cnx_text_box_${id}`}
                name={`cnx_text_box_${name}`}
                size="small"
                placeholder={placeholder}
                value={displayValue}
                disabled={disabled}
                inputProps={{
                    maxLength: maxLength,
                }}
                InputProps={{
                    endAdornment: renderClearIcon(),
                }}
                onChange={(e) => {
                    handleChange(e.target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') onEnterKeyRef.current?.();
                }}
            />
        </FormControl>
    );
};

export default React.memo(CnxTextBox);
