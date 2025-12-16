import React, { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

export default function DatePickerInput({
    value,
    onChange,
    onOpen,
    options = {},
    placeholder = 'Pick a date',
    formatDisplay = (v) => v,
    icon = '📅',
    className = 'picker-control'
}) {
    const inputRef = useRef(null);
    const pickerRef = useRef(null);
    const controlRef = useRef(null);

    useEffect(() => {
        if (!inputRef.current) return;

        pickerRef.current = flatpickr(inputRef.current, {
            ...options,
            defaultDate: value || null,
            onChange: (selectedDates, dateStr) => {
                onChange(selectedDates, dateStr);
            },
            onOpen: () => {
                onOpen?.();
            }
        });

        return () => pickerRef.current?.destroy();
    }, []);


    useEffect(() => {
        if (pickerRef.current) {
            Object.entries(options).forEach(([key, val]) => {

                if (key === 'minDate' || key === 'minTime' || key === 'maxDate') {
                    pickerRef.current.set(key, val);
                }
            });
        }
    }, [options.minDate, options.minTime, options.maxDate]);


    useEffect(() => {
        if (pickerRef.current) {
            const currentValue = pickerRef.current.selectedDates[0];

            if (value !== currentValue && value !== pickerRef.current.input.value) {
                pickerRef.current.setDate(value || null, false);
            }
        }
    }, [value]);

    return (
        <div
            ref={controlRef}
            className={className}
            onClick={() => pickerRef.current?.open?.()}
        >
            <span className="picker-icon">{icon}</span>
            <span>{value ? formatDisplay(value) : placeholder}</span>
            <input ref={inputRef} type="text" className="picker-hidden" readOnly />
        </div>
    );
}
