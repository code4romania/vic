import React from 'react';
import {
  Archive,
  Book,
  Camera,
  Heart,
  Clipboard,
  Coffee,
  Gift,
  Scissors,
  Truck,
  Package,
} from 'react-feather';
import { classNames } from '../common/utils/utils';

export const ICON_MAPPER: Record<string, React.ReactNode> = {
  box: <Book />,
  heart: <Heart />,
  archive: <Archive />,
  book: <Book />,
  camera: <Camera />,
  clipboard: <Clipboard />,
  coffee: <Coffee />,
  gift: <Gift />,
  scissors: <Scissors />,
  truck: <Truck />,
  package: <Package />,
};

export const IMAGE_OPTIONS = [
  {
    key: 'box',
    component: <Book />,
  },
  {
    key: 'heart',
    component: <Heart />,
  },
  {
    key: 'archive',
    component: <Archive />,
  },
  {
    key: 'book',
    component: <Book />,
  },
  {
    key: 'camera',
    component: <Camera />,
  },
  {
    key: 'clipboard',
    component: <Clipboard />,
  },
  {
    key: 'coffee',
    component: <Coffee />,
  },
  {
    key: 'gift',
    component: <Gift />,
  },
  {
    key: 'scissors',
    component: <Scissors />,
  },
  {
    key: 'truck',
    component: <Truck />,
  },
];

export const ImageOption = ({
  item,
  component,
  selected,
  onChange,
}: {
  item: string;
  component: React.ReactNode;
  selected?: boolean;
  onChange?: (value: string) => void;
}) => (
  <div
    onClick={() => onChange && onChange(item)}
    className={classNames(
      'h-12 w-12 rounded-full bg-cool-gray-100 flex items-center justify-center cursor-pointer',
      selected ? 'bg-cool-gray-300' : 'bg-cool-gray-100',
    )}
  >
    {component}
  </div>
);

interface ImagePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const ImagePicker = ({ value, onChange, label }: ImagePickerProps) => (
  <div className="flex flex-col gap-1">
    {label && <label htmlFor={`${label}__input`}>{label}</label>}
    <div className="flex flex-wrap gap-4">
      {IMAGE_OPTIONS.map((item) => (
        <ImageOption
          key={item.key}
          item={item.key}
          component={item.component}
          selected={item.key === value}
          onChange={onChange}
        />
      ))}
    </div>
  </div>
);

export default ImagePicker;
