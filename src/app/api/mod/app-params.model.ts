import { Title } from '@angular/platform-browser';
import { ColumnInfo } from './app-column.model';
export class RequestParams {
  /***** Server side routeTemplate *******
   *
   * api/{controller}/{table}/{key}/{keyField}/{includedFields}/{filter}/{sortFields}/{pageNumber}/{pageSize}",
   * {controller} = app
   * {table} = code
   * {key} = key (back-tick delimited)
   * {keyField} = keyField (back-tick delimited)
   * {includedFields} = includedFields (back-tick delimited)
   *
   * ??? thinking of removing if the key/keyField construction will suffice
   * as filter expression
   * {filter} = filter
   *
   * {sortFields} = sortFields  (back-tick delimited)
   * ??? thinking of accommodating multi-page parameter
   * i.e. p1,p2,p3   ps-pe  p1,p2,p3,p4-p#
   * {pageNumber} = pageNumber
   * {pageSize} = pageSize
   *****************************************/

  constructor(args?: {
    code?: string;
    filter?: string;
    snap?: boolean;
    fields?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
  }) {
    if (!args) args = {};
    const { code, filter, snap, fields, sort, page, pageSize } = args;
    if (code != undefined) this.code = code;
    if (filter != undefined) this.filter = filter;
    if (snap != undefined) this.snapshot = snap;
    if (fields != undefined) this.includedFields = fields;
    if (sort != undefined) this.sortFields = sort;
    if (page != undefined) this.pageNumber = page;
    if (pageSize != undefined) this.pageSize = pageSize;
  }

  code: string;
  key?: string;
  keyField?: string;
  includedFields?: string;
  filter?: string;
  fieldMap?: string;
  sortFields?: string;
  pageNumber?: number;
  pageSize?: number;
  subsKey?: string;
  requestConfig?: string;
  forceRequest?: boolean;
  clearExisting?: boolean;
  snapshot?: boolean;
  distinct?: boolean;
  XTRA?: any;
}

export interface ILookupSource {
  value: number;
  display: string;
}

export interface ILookupParams {
  table?: any;
  displayField?: string;
  groupValue?: number;
  groupField?: string;
  notFoundDislay?: string;
  subLookupParams?: ILookupParams;
  formXTRA?: string;

  lookupSource?: Array<ILookupSource>;
  lookupValueField?: string;
  lookupDisplayField?: string;

  toggleDisplay?: Array<any>;

  inlineLookupTableAlias?: string; // lookup table alias as defined in the call to join methods
  inlineLookupTableField?: string; // display field from the linked lookup table
  inlineLookupFieldAlias?: string; // lookup field which will be used as source display field of the column

  inlineLookupCode?: string; // display code field from the linked lookup table
  inlineLookupText?: string; // display text field from the linked lookup table
  inlineLookupFore?: string; // display forecolor field from the linked lookup table
  inlineLookupBack?: string; // display backcolor field from the linked lookup table

  useLookupCode?: boolean; // flag to show lookup code instead of text on data grid

  inlineCodeIdx?: number;
  inlineForeIdx?: number;
  inlineBackIdx?: number;
}

export interface IColorParams {
  foreGround?: any;
  backGround?: any;
}

export interface IAppVersion {
  ver: string;
  build: string;
  updates: Array<string>;
  history?: Array<IAppVersion>;
}

export interface IAppVer {
  label: string;
  tipText: string;
}

export enum SQLJoinType {
  INNER_JOIN = '-',
  LEFT_JOIN = '`',
}
export enum SQLJoinChars {
  INNER_JOIN_SYMBOL = '-',
  LEFT_JOIN_SYMBOL = '`',
  TABLE_CODE_SEPARATOR = '|',
  JOIN_SEPARATOR = ';',
  FIELD_SEPARATOR = ',',
  ALIAS_SEPARATOR = '@',
}

export enum NodeFieldAliases {
  NODE_CODE = 'NODE_CODE',
  NODE_TEXT = 'NODE_TEXT',
  NODE_LOCATION = 'NODE_LOC',
}

//|-tre,DD_ASSET,DD_TRE_DAT_TAG;
//    `lkp,DD_PARAM_UNIT;
//    `node,DD_ASSET;
//    `desprm,DD_PARAM`lkp@unit,DD_PARAM_TYPE
export interface IFromClauseLink {
  code: string; // configured table code
  alias?: string; // table alias to be used when selecting field
  join?: SQLJoinChars; // assigned by method called (i.e. inner or left join)
  localField: string; // link field found in the parent table
  foreignField?: string; // link field found in the child table
  leftJoin?: IFromClauseLink; // sub left join params
  innerJoin?: IFromClauseLink; // sub inner join params
}

export interface IFieldMap {
  nickName: string;
  fieldName: string;
}
