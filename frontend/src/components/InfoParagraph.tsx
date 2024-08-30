import React, { DetailedHTMLProps, HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'react-tooltip';

interface InfoParagraphProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement> {
  text: string;
  tooltip?: boolean;
  tooltipContent?: string;
  highlighted?: boolean;
}

export const InfoParagraph = ({
  text,
  tooltip,
  tooltipContent,
  highlighted,
  className,
  ...rest
}: InfoParagraphProps) => {
  const { t } = useTranslation('doc_templates');

  return (
    <>
      <span
        className={`bg-gray-200 rounded px-1 ${highlighted && 'bg-yellow'} text-wrap ${className}`}
        data-tooltip-id={`paragraph-tooltip-${text}-${tooltipContent}`}
        {...rest}
      >
        {text}
      </span>
      {tooltip && (
        <Tooltip
          id={`paragraph-tooltip-${text}-${tooltipContent}`}
          place="top"
          content={tooltipContent || t('tooltip')}
          opacity={1}
          style={{
            maxWidth: '250px',
            zIndex: 100_000,
            backgroundColor: 'rgb(255 210 9)',
            color: 'black',
          }}
        />
      )}
    </>
  );
};
