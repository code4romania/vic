/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { QueryParams } from 'use-query-params';
import {
    getPaginationQueryParams,
    IPaginationQueryParams,
} from '../../common/constants/pagination';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import { DocumentTemplateTableSelectable } from '../../components/DocumentTemplateTableSelectable';
import { IDocumentTemplateListItem } from '../../common/interfaces/template.interface';

export interface DocumentTemplatesQueryProps extends IPaginationQueryParams { }

export type DocumentTemplatesSelectableProps = IHOCQueryProps<DocumentTemplatesQueryProps> & {
    selectedTemplate: IDocumentTemplateListItem | null;
    onSelectTemplate: (template: IDocumentTemplateListItem) => void;
}

// set page default params
const DEFAULT_QUERY_PARAMS = getPaginationQueryParams({ orderBy: 'name' });

// set defaults (if needed) for other specific filter params
const DocumentTemplatesTableSelectableWithQueryParams = ({ selectedTemplate, onSelectTemplate }: { selectedTemplate: IDocumentTemplateListItem | null, onSelectTemplate: (template: IDocumentTemplateListItem) => void }) => {
    // set query config
    const queryConfig = {
        ...DEFAULT_QUERY_PARAMS,
    };

    return (
        <QueryParams config={queryConfig}>
            {(props: any) => {
                return <DocumentTemplateTableSelectable {...props} selectedTemplate={selectedTemplate} onSelectTemplate={onSelectTemplate} />;
            }}
        </QueryParams>
    );
};

export default DocumentTemplatesTableSelectableWithQueryParams;
