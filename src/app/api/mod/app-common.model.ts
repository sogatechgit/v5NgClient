export class KeyValuePair {
  key: string;
  value: any;
}

export interface LastRequestParams {
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  pageBookmarkStart?: number;
  pageBookmarkEnd?: number;
  recordCount?: number;
  totalRecords?: number;
}
