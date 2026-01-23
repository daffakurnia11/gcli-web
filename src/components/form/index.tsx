import type { FormComponent } from "@/types/Form";

import { Checkbox } from "./Checkbox";
import { DateInput } from "./Date";
import { Dropzone } from "./Dropzone";
import { Number as NumberInput } from "./Number";
import { Radio } from "./Radio";
import { Select } from "./Select";
import { Text } from "./Text";
import { Textarea } from "./Textarea";

const Form = {} as FormComponent;
Form.Text = Text;
Form.Number = NumberInput;
Form.Select = Select;
Form.Date = DateInput;
Form.Textarea = Textarea;
Form.Dropzone = Dropzone;
Form.Radio = Radio;
Form.Checkbox = Checkbox;

export { Form };

export { Checkbox } from "./Checkbox";
export { DateInput } from "./Date";
export { Dropzone } from "./Dropzone";
export { FieldWrapper } from "./FieldWrapper";
export { Number as NumberInput } from "./Number";
export { Radio } from "./Radio";
export { Select } from "./Select";
export { Text } from "./Text";
export { Textarea } from "./Textarea";
export type {
  BaseInputProps,
  CheckboxProps,
  DateInputProps,
  DropzoneProps,
  FieldWrapperProps,
  FileValidation,
  FormComponent,
  FormSize,
  NumberInputProps,
  RadioOption,
  RadioProps,
  SelectOption,
  SelectProps,
  TextareaProps,
  TextareaResize,
  TextInputProps,
} from "@/types/Form";
