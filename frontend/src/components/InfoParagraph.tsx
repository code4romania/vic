import React, { DetailedHTMLProps, HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'react-tooltip';

interface InfoParagraphProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement> {
  text: string;
  tooltip?: boolean;
  tooltipTheme?: 'info' | 'error';
  tooltipContent?: string;
  highlighted?: boolean;
}

export const InfoParagraph = ({
  text,
  tooltip,
  tooltipTheme = 'info',
  tooltipContent,
  highlighted,
  className,
  ...rest
}: InfoParagraphProps) => {
  const { t } = useTranslation('doc_templates');

  return (
    <>
      <span
        className={`${tooltipTheme === 'error' ? 'bg-red-400' : 'bg-gray-200'} rounded px-1 ${highlighted && 'bg-yellow'} text-wrap ${className}`}
        data-tooltip-id={`paragraph-tooltip-${text}-${tooltipContent}`}
        {...rest}
      >
        {text}
      </span>
      {tooltip &&
        (tooltipTheme === 'info' ? (
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
        ) : (
          <Tooltip
            id={`paragraph-tooltip-${text}-${tooltipContent}`}
            place="top"
            content={tooltipContent || t('tooltip')}
            arrowColor="rgb(248 113 113)"
            border="2px solid rgb(248 113 113)"
            opacity={1}
            style={{
              maxWidth: '250px',
              zIndex: 100_000,
              backgroundColor: 'white',
              color: 'black',
            }}
          />
        ))}
    </>
  );
};
