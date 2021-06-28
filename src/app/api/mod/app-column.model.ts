export class FieldInfo {
  constructor(
    public name: string,
    public type?: string,
    public caption?: string,
    public alias?: string,
    public roles?: string,
    public isParameter?: boolean
  ) {
    if (this.type == undefined) this.type = 'string';
    if (this.caption == undefined) this.caption = '';
    if (this.alias == undefined) this.alias = '';
    if (this.roles == undefined) this.roles = '';
    if (this.isParameter == undefined) this.isParameter = true;

    // // set stamp fields based on the field names
    // const fn = this.name.toUpperCase();

    // if (
    //   !this.isDeletedStamp &&
    //   this.type == 'Date' &&
    //   (fn.endsWith('_DELETED') || fn.endsWith('_DELETED_DATE'))
    // )
    //   this.isDeletedStamp = true;
    // if (
    //   !this.isDeletedByStamp &&
    //   this.type == 'string' &&
    //   fn.endsWith('_DELETED_BY')
    // )
    //   this.isDeletedByStamp = true;

    // if (
    //   !this.isCreatedStamp &&
    //   this.type == 'Date' &&
    //   (fn.endsWith('_CREATED') || fn.endsWith('_CREATED_DATE'))
    // )
    //   this.isCreatedStamp = true;
    // if (
    //   !this.isCreatedByStamp &&
    //   this.type == 'string' &&
    //   fn.endsWith('_CREATED_BY')
    // )
    //   this.isCreatedByStamp = true;

    // if (
    //   !this.isUpdatedStamp &&
    //   this.type == 'Date' &&
    //   (fn.endsWith('_UPDATED') || fn.endsWith('_UPDATED_DATE'))
    // )
    //   this.isUpdatedStamp = true;
    // if (
    //   !this.isUpdatedByStamp &&
    //   this.type == 'string' &&
    //   fn.endsWith('_UPDATED_BY')
    // )
    //   this.isUpdatedByStamp = true;
  }

  public isDataGroup: boolean = false;

  public isDeletedField: boolean = false;
  public isAssetField: boolean = false;

  public isDeletedStamp: boolean = false;
  public isDeletedByStamp: boolean = false;

  public isCreatedStamp: boolean = false;
  public isCreatedByStamp: boolean = false;
  public isUpdatedStamp: boolean = false;
  public isUpdatedByStamp: boolean = false;

  public isLookupCode: boolean = false;
  public isLookupText: boolean = false;
  public isLookupGroup: boolean = false;
  public isLookupBack: boolean = false;
  public isLookupFore: boolean = false;

  public lookupSwitch: Array<any> = null;
}

export class ColumnInfo extends FieldInfo {
  constructor(
    public name: string,
    public type?: string,
    public caption?: string,
    public alias?: string,
    public roles?: string,

    public keyPosition: number = -1,
    public uniquePosition: number = -1,
    public groupPosition: number = -1,
    public sortPosition: number = -1,
    public displayPosition: number = -1,

    public isParameter: boolean = false,
    public isRequired: boolean = false,
    public isLong: boolean = false,

    public table: any = null
  ) {
    super(name, type, caption, alias, roles, isParameter);

    if (roles) {
      const roleArr = roles.split(';');
      roleArr.forEach((r) => {
        const isDateStamp = r.startsWith('datestamp|');
        const isUserStamp = r.startsWith('userstamp|');

        const isProperty = r.startsWith('@');

        if (isProperty) {
          // separate property name and property value

          const rArr = (r + '=').split('=');

          // split property value into string array
          // to determine if sub-property is defined...
          const valArr: Array<string> = rArr[1].split(',');
          // assign property value
          const propKey = rArr[0].substr(1);
          const propVal = valArr[0];
          this.props[propKey] = propVal;

          // check if calue array is more than one element
          // and check if the second element is equal to 'usetext' which
          // will allow usage of the lookup text as value instead
          // of the record id.

          if (valArr.length > 1) {
            if (valArr[1] == 'usetext') this.props['useLookupText'] = true;
          } else if (propKey == 'lookupswitch') {
            // this.lookupSwitch = [];
            if (propVal == 'YN') {
              this.lookupSwitch = [
                { value: 1, display: 'Yes' },
                { value: 0, display: 'No' },
              ];
            } else if (propVal == 'YN-') {
              this.lookupSwitch = [
                { value: 1, display: 'Yes' },
                { value: 0, display: 'No' },
                { value: null, display: '-' },
              ];
            } else {
              // build lookupswitch
              this.lookupSwitch = [];
              const optArr: Array<string> = this.props[propKey].split('|');
              // last element always serves as default value...
              optArr.forEach((e) => {
                const opArr: Array<string> = e.split(':'); // split option value and display
                const value = isNaN(+opArr[0]) ? opArr[0] : +opArr[0];
                this.lookupSwitch.push({
                  value: opArr.length == 1 ? null : value,
                  display: opArr.length == 1 ? value : opArr[1],
                });
              });
            }
          }

          //
        } else if (isDateStamp || isUserStamp) {
          // set stamp flag
          this.isFieldDateStamp = isDateStamp;
          this.isFieldUserStamp = isUserStamp;

          // record linked field(s)
          const fldArr = r.split('|')[1].split(',');
          fldArr.forEach((fld) => {
            if (!fld) return;
            // if linked field is not yet registered
            if (this.StampLinkFields.indexOf(fld) == -1)
              this.StampLinkFields.push(fld);

            if (this.table.stampLinkedFields.indexOf(fld) == -1) {
              this.table.stampLinkedFields.push(fld);
            }
          });
        } else {
          // lookup flags
          // if (r == 'lkpcode') this.isLookupCode = true;
          // if (r == 'lkptext') this.isLookupText = true;
          // if (r == 'lkpgroup') this.isLookupGroup = true;
          // if (r == 'lkpfore') this.isLookupFore = true;
          // if (r == 'lkpback') this.isLookupBack = true;
          this.isRequired = r == 'required';
        }
      });
    } // if roles is specified...

    if (table) {
      const {
        lookupCode,
        lookupText,
        lookupGroup,
        lookupFore,
        lookupBack,
        assetField,
        revisionField,
        referenceField,
        deletedFlagField,
        deletedDateStamp,
        deletedByStamp,
        createdDateStamp,
        createdByStamp,
        updatedDateStamp,
        updatedByStamp,
        assessedDateStamp,
        assessedByStamp,
        dataGroup,
      } = table.clientConfig;

      if (assetField == name) this.isAssetField = true;
      if (deletedFlagField == name) this.isDeletedField = true;
      if (deletedDateStamp == name) this.isDeletedStamp = true;
      if (deletedByStamp == name) this.isDeletedByStamp = true;
      if (createdDateStamp == name) this.isCreatedStamp = true;
      if (createdByStamp == name) this.isCreatedByStamp = true;
      if (updatedDateStamp == name) this.isUpdatedStamp = true;
      if (updatedByStamp == name) this.isUpdatedByStamp = true;
      if (dataGroup == name) this.isDataGroup = true;
      if ((referenceField + '|').split('|')[0] == name) {
        this.isReference = true;
        this.format = (referenceField + '|').split('|')[1];
      }
      if (revisionField == name) this.isRevision = true;
      if (lookupCode == name) this.isLookupCode = true;
      if (lookupText == name) this.isLookupText = true;
      if (lookupGroup == name) this.isLookupGroup = true;
      if (lookupFore == name) this.isLookupFore = true;
      if (lookupBack == name) this.isLookupBack = true;
    }

  }

  public StampLinkFields: Array<string> = [];
  public isFieldDateStamp: boolean;
  public isFieldUserStamp: boolean;
  public isReference: boolean;
  public format: string;
  public isRevision: boolean;

  public props: any = {};

  private _UserStampColumn: ColumnInfo;
  public get UserStampColumn(): ColumnInfo {
    const colName: string = this.name;
    if (this._UserStampColumn == undefined) {
      if (this.table.stampLinkedFields.indexOf(this.name) == -1) {
        this._UserStampColumn = null;
      } else {
        // assign proper _UserStampColumn value
        this._UserStampColumn = this.table.columns.find(
          (c) => c.StampLinkFields.indexOf(colName) != -1 && c.isFieldUserStamp
        );
      }
    }
    return this._UserStampColumn;
  }

  private _DateStampColumn: ColumnInfo;
  public get DateStampColumn(): ColumnInfo {
    const colName: string = this.name;
    if (this._DateStampColumn == undefined) {
      if (this.table.stampLinkedFields.indexOf(this.name) == -1) {
        this._DateStampColumn = null;
      } else {
        // assign proper _UserStampColumn value
        this._DateStampColumn = this.table.columns.find(
          (c) => c.StampLinkFields.indexOf(colName) != -1 && c.isFieldDateStamp
        );
      }
    }
    return this._DateStampColumn;
  }

  get isCreated(): boolean {
    return this.isToggleField('created');
  }

  get isCreatedBy(): boolean {
    console.log(
      '\nfinding isCreatedBy...',
      this.isToggleField('createdby', 'created_by')
    );
    return this.isToggleField('createdby', 'created_by');
  }

  get isUpdated(): boolean {
    return this.isToggleField('updated');
  }

  get isUpdatedBy(): boolean {
    return this.isToggleField('updatedby', 'updated_by');
  }

  get isLocked(): boolean {
    return this.isToggleField('locked');
  }

  get isLockedBy(): boolean {
    return this.isToggleField('lockedby', 'locked_by');
  }

  get IsStampField(): boolean {
    return (
      this.isCreated ||
      this.isCreatedBy ||
      this.isLocked ||
      this.isLockedBy ||
      this.isUpdated ||
      this.isUpdatedBy
    );
  }

  get IsKeyField(): boolean {
    return this.keyPosition != -1;
  }

  get IsForRestore(): boolean {
    return !this.IsKeyField && !this.IsStampField;
  }

  get Label(): string {
    return this.caption != '' ? this.caption : this.name;
  }

  private isToggleField(compareName: string, orCompareName?: string): boolean {
    if (name == null || this.table.tableFieldPrefix == null) return false;

    let prefix: string = this.table.tableFieldPrefix.toLowerCase();
    let ret: boolean = this.name.toLowerCase() == prefix + compareName;
    if (!ret && orCompareName != undefined)
      ret = this.name.toLowerCase() == prefix + orCompareName;

    return ret;
  }
}
