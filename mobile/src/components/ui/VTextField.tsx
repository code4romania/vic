import React, { forwardRef } from 'react';
import { TextField, TextFieldProps } from '../../design/components/TextField';

export interface VTextFieldProps extends TextFieldProps {
  label: string;
  error?: string;
  /** Input component to render, e.g. BottomSheetTextInput inside a sheet. */
  InputComponent?: React.ComponentType<any>;
  /** Shown before the text, e.g. the +40 prefix of a phone number. */
  leading?: React.ReactNode;
  /** Small text under the field when there is no error. */
  helper?: string;
}

/**
 * Legacy name of the „Îndrăzneț” TextField (src/design/components/TextField): label above, white
 * 56pt field, navy outline + yellow halo on focus, red outline and message on error.
 */
export const VTextField = forwardRef<any, VTextFieldProps>((props, ref) => (
  <TextField ref={ref} {...props} />
));

VTextField.displayName = 'VTextField';

export default VTextField;
