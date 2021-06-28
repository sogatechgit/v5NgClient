import { AppInputAComponent } from './../app-input-a/app-input-a.component';
import { AppDataset } from './../../../svc/app-dataset.service';
import { AppMainServiceService } from './../../../svc/app-main-service.service';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss'],
})
export class FileUploaderComponent implements OnInit {
  @Input() Multiple: boolean = true;
  @Input() RootFolder: string = this.ds.referenceRoot;

  private _SubFolder: string = '';
  @Input() set SubFolder(value: string) {
    this._SubFolder = value;
    this.forUpload0.SubFolder = this._SubFolder;

    // re-check file status
    this.forUpload0.ProcessFileSelectEvent();
    // console.log('SUBFOLDER: ', value);
  }
  get SubFolder(): string {
    return this._SubFolder;
  }

  @Input() MaximumActiveFiles: number = 2;
  @Input() MaximumActiveChunks: number = 3;
  @Input() ProgressOnly: boolean = false;

  private _LinkedInput: AppInputAComponent;
  @Input() set LinkedInput(value: AppInputAComponent) {
    this._LinkedInput = value;
    this.forUpload0.LinkedInput = this._LinkedInput;
  }

  //LinkedInput

  @Input() set Hidden(value: boolean) {
    this._hidden = value;
  }

  @Input() files: Array<IFileUploadInfo> = [];
  active: Array<IFileUploadInfo> = [];

  forUpload: Array<FileUploader> = [];

  selectedFile = null;

  constructor(
    public dataSource: AppMainServiceService,
    private http: HttpClient
  ) {}

  private CHUNK_SIZE: number = 1024 * 1024 * 1;
  private maxSequence: number = -1;
  private currentSequence: number = 0;
  private uploadedSize: number = 0;
  private chunkCount: number = 0;

  private _hidden: boolean = true;
  show() {
    this._hidden = false;
  }
  hide() {
    this._hidden = true;
  }

  get forUpload0(): FileUploader {
    if (!this.forUpload) this.forUpload = [];

    const createNew: boolean =
      this.forUpload.length == 0 ? true : !this.forUpload[0] ? true : false;

    if (createNew)
      this.forUpload.push(
        new FileUploader(this.http, this.ds, this.RootFolder, this.SubFolder)
      );

    return this.forUpload[0];
  }

  get ProgressDisplaySingle(): string {
    let per: number = 0;
    if (this.forUpload0.files.length) {
      const fi = this.forUpload0.files[0];
      per = Math.round((100 * (fi.uploaded + fi.pending)) / fi.total);
    }

    return `${per}%`;
  }

  ProgressDisplay(fi: IFileUploadInfo): string {
    const perc = Math.round((100 * (fi.uploaded + fi.pending)) / fi.total);
    return perc.toString() + '%';
  }

  get hidden(): boolean {
    return this._hidden;
  }

  get ds(): AppDataset {
    return this.dataSource.ActiveSource.appDataset;
  }

  ngOnInit(): void {}

  onFileSelected(event) {
    this.forUpload0.ProcessFileSelectEvent(event);
  }

  onUpload() {
    this.forUpload0.Upload();
  }

  Upload(onComplete?:Function) {
    this.forUpload0.Upload(onComplete);
  }
}

export interface IFileUploadInfo {
  // subs?: Subscription;
  name?: string;
  file?: any;
  size?: number;
  modified?: number;
  type?: string;
  complete?: boolean;
  inprogress?: boolean;
  failed?: boolean;
  uploaded?: number;
  pending?: number;
  total?: number;
  chunks?: Array<IFileChunkInfo>;
}

export interface IFileChunkInfo {
  index: number;
  start: number;
  end: number;
  uploaded?: number;
  total: number;
  complete?: boolean;
  existing?: boolean;
  inprogress?: boolean;
}

export class FileUploader {
  constructor(
    public http: HttpClient,
    public DataSet: AppDataset,
    public RootFolder: string,
    public SubFolder?: string,

    public fileSelectEvent?: any,

    public MaximumActiveFiles?: number,
    public MaximumActiveChunks?: number,
    public CHUNK_SIZE?: number
  ) {
    if (!MaximumActiveFiles) this.MaximumActiveFiles = 2;
    if (!MaximumActiveChunks) this.MaximumActiveChunks = 3;
    if (!CHUNK_SIZE) this.CHUNK_SIZE = 1024 * 1024 * 1;

    // this.DataSet = dataSet;

    if (this.fileSelectEvent) this.ProcessFileSelectEvent(fileSelectEvent);
  }

  public onUploadComplete: Function = null;

  // private MaximumActiveFiles: number;
  // private MaximumActiveChunks: number;

  // private CHUNK_SIZE: number;
  private maxSequence: number = -1;
  private currentSequence: number = 0;
  private uploadedSize: number = 0;
  private chunkCount: number = 0;

  // private DataSet: AppDataset;
  // private RootFolder: string;
  // private SubFolder: string;

  public LinkedInput: AppInputAComponent;

  selectedFile = null;

  files: Array<IFileUploadInfo> = [];
  active: Array<IFileUploadInfo> = [];

  get url(): string {
    return this.DataSet.urlBase + '/FileUpload';
  }
  get urlStatus(): string {
    return this.url + '/UploadStatus';
  }

  get urlCheckStatus(): string {
    return this.url + '/CheckStatus';
  }

  get urlUpload(): string {
    return this.url + '/UploadFile';
  }

  get urlMerge(): string {
    //
    return this.url + '/MergeChunks';
  }

  private _LastEvent: any;

  ProcessFileSelectEvent(e?: any) {
    const event = e ? e : this._LastEvent;
    if (!event) return;

    if (e) this._LastEvent = e;

    console.log('!!!onFileSelected... ');
    console.log(event, this.url);
    const files = event.target.files;
    this.files = [];
    this.active = [];

    if (this.LinkedInput && files.length != 0) {
      //files[0].name;
      this.LinkedInput.value = files[0].name;
    }

    for (let fIdx = 0; fIdx < files.length; fIdx++) {
      const f = files[fIdx];
      if (!f) continue;
      const size = f.size;

      let fi: IFileUploadInfo = {};

      fi.name = f.name;
      fi.size = size;
      fi.file = f;
      fi.modified = f.lastModified;
      fi.chunks = [];

      fi.type = f.type;

      fi.pending = 0;
      fi.uploaded = 0;
      fi.total = 0;

      fi.complete = false;
      fi.inprogress = false;
      fi.failed = false;

      const remainder = size % this.CHUNK_SIZE;
      const count = (size - remainder) / this.CHUNK_SIZE + (remainder ? 1 : 0);
      let total: number = 0;
      for (let idx = 0; idx < count - (remainder ? 1 : 0); idx++) {
        const pos = idx * this.CHUNK_SIZE;
        // const end = pos + this.CHUNK_SIZE - 1;
        const end = pos + this.CHUNK_SIZE;
        // fi.total += end - pos + 1;
        fi.total += end - pos;
        fi.chunks.push({
          index: idx,
          start: pos,
          end: end,
          uploaded: 0,
          total: end - pos,
          // total: end - pos + 1,
          complete: false,
          existing: false,
          inprogress: false,
        });
      }
      if (remainder) {
        const idx = count - 1;
        const pos = idx * this.CHUNK_SIZE;
        const end = pos + remainder;
        // const end = pos + remainder - 1;
        fi.total += end - pos;
        // fi.total += end - pos + 1;

        fi.chunks.push({
          index: idx,
          start: pos,
          end: end,
          uploaded: 0,
          total: end - pos,
          // total: end - pos + 1,
          complete: false,
          existing: false,
          inprogress: false,
        });
      }
      this.files.push(fi);
    } // files iteration

    const fd: FormData = new FormData();
    const fiArr: Array<IFileChunkInfo> = [];
    this.files.forEach((fi) => {
      fiArr.push(this.GetFileInfo(fi));
    });
    fd.append('FileInfo', JSON.stringify(fiArr));
    fd.append('RootFolder', this.RootFolder);
    fd.append('SubFolder', this.SubFolder);

    console.log('Files: ', this.files, ', fiArr:', fiArr);

    const obs = this.http.post(this.urlCheckStatus, fd, {
      reportProgress: true,
      observe: 'events',
    });

    const subs = obs.subscribe(
      (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          console.log(
            `Progress: ${
              Math.round((10000 * event.loaded) / event.total) / 100
            }`
          );
        } else if (event.type === HttpEventType.Response) {
          //const {FileInfos,status} = event.body;
          const body: any = event.body;
          const { status, message, FileInfos } = body;

          if (status == 'success') {
            FileInfos.forEach((fi) => {
              console.log('File info: ', fi);
              const sta = fi.status;
              const name = fi.name;
              const file = this.files.find((f) => f.name == name);
              if (file) {
                if (sta == 'resume') {
                  file.uploaded = 0;
                  const chkArr = fi.chunks_found.split(',');
                  let uploaded: number = 0;
                  for (let idx = 0; idx < chkArr.length; idx++) {
                    const chk = file.chunks.find(
                      (c) => c.index == +chkArr[idx]
                    );

                    chk.existing = true;
                    chk.complete = true;
                    chk.uploaded = chk.total;

                    file.uploaded += chk.uploaded; // total uploaded part of file
                  }
                } else if (sta == 'existing') {
                  file.complete = true;
                  file.uploaded = file.total;
                } else {
                }
              }
            });
          } else if (status == 'error') {
            // prompt user and stop uploading
            console.log('Error checking status: ', message);
          }
          console.log('RESPONSE: ', event, '\nFILES: ', this.files);
          // this.UploadChunks(FileInfo);
          // this.UploadFile(1);
        }
      },
      (err) => {
        console.log('Error: ', err);
      },
      () => {
        // console.log('Complete checking: ', fileToProcess);
        subs.unsubscribe();
      }
    );

    this.maxSequence = this.chunkCount;
  }

  GetFileInfo(fileInfo: IFileUploadInfo): any {
    const info: any = {};
    for (var key in fileInfo) {
      if (key == 'file') continue;
      const val: any = fileInfo[key];
      if (key == 'chunks') {
        info[key] = [];
        info[key].push(val[0]);
        info[key].push(val[val.length - 1]);
      } else if (key == 'subs' || key == 'active_chunks') {
      } else {
        info[key] = val;
      }
    }
    return info;
  }

  GetFileInfoParams(
    fileInfo: IFileUploadInfo,
    chunk?: IFileChunkInfo
  ): FormData {
    const fd = new FormData();

    const info: any = this.GetFileInfo(fileInfo);

    fd.append('FileInfo', JSON.stringify(info));
    fd.append('RootFolder', this.RootFolder);
    fd.append('SubFolder', this.SubFolder);

    if (chunk) fd.append('chunk', JSON.stringify(chunk));

    return fd;
  }

  UploadChunk(fileInfo: IFileUploadInfo, chunk: IFileChunkInfo) {
    const fd: FormData = this.GetFileInfoParams(fileInfo, chunk);
    const file = this.files.find((f) => f.name == fileInfo.name);
    if (!file) return;

    fd.append('object', file.file.slice(chunk.start, chunk.end), file.name);

    chunk.inprogress = true;

    this.http
      .post(this.urlUpload, fd, {
        reportProgress: true,
        observe: 'events',
      })
      .subscribe((event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const fac = event.loaded / event.total;
          const newupl = file.uploaded + fac * chunk.total;
          //file.uploaded += Math.min(newupl, file.total);
          //

          // file.pending = fac * chunk.total;

          // console.log(
          //   `Upload Progress: ${
          //     Math.round((10000 * event.loaded) / event.total) / 100
          //   } file.total:${file.total}, file.uploaded: ${file.uploaded}, factor: ${fac}, newupl: ${newupl}, chunk total: ${chunk.total}`
          // );
        } else if (event.type === HttpEventType.Response) {
          const body: any = event.body;
          const { status, message, chunk, FileInfo } = body;

          // set chunk complete status to true
          // get file chunk
          const file = this.files.find((f) => f.name == FileInfo.name);
          if (file) {
            const chk: IFileChunkInfo = file.chunks.find(
              (ch) => ch.index == chunk.index
            );
            if (chk) {
              chk.complete = true;
              chk.inprogress = false;
              chk.uploaded = chk.total;

              file.pending = 0;
              file.uploaded += chk.total;
              // call another upload cycle
              this.UploadChunks(FileInfo);
            }
          }
        }
      }); // this.http
  }

  UploadChunks(fileInfo: IFileUploadInfo) {
    const file = this.files.find((f) => f.name == fileInfo.name);
    if (!file) {
      // console.log('No File ...');
      return;
    }

    const notComplete = file.chunks.filter(
      (ch) => !(ch.complete || ch.existing)
    );
    if (notComplete.length == 0) {
      // set file complete flag
      file.complete = true;
      file.inprogress = false;

      // remove element from active array
      //const idx = this.active.indexOf(fileInfo);
      const idx = this.active.findIndex((f) => f.name == fileInfo.name);
      console.log('####### FILE INFO INDEX ########: ', idx);
      if (idx != -1) this.active.splice(idx, 1);

      console.log('All chunks complete ...', this.files);

      this.MergeChunks(fileInfo);

      // if all active file processing is complete
      // if(this.active.filter(f=>f.complete).length == 0) this.onUpload();
      this.Upload();

      // call onUpload to fetch another file to upload!

      return;
    }

    const unprocessed = file.chunks.filter(
      (ch) => !ch.complete && !ch.existing && !ch.inprogress
    );
    if (unprocessed.length == 0) {
      return;
    }

    const inProgress = unprocessed.filter((ch) => ch.inprogress);
    if (inProgress.length == this.MaximumActiveChunks) {
      // console.log('Max Count in progress ...');
      return;
    }

    let ctr: number = inProgress.length;
    unprocessed.forEach((chk: IFileChunkInfo) => {
      if (ctr == this.MaximumActiveChunks) {
        // console.log('Max Count in selection ...');
        return;
      }
      this.UploadChunk(fileInfo, chk);
      ctr++;
    });
  }

  MergeChunks(fileInfo: IFileUploadInfo) {
    const fd: FormData = this.GetFileInfoParams(fileInfo);
    //urlMerge
    this.http
      .post(this.urlMerge, fd, {
        reportProgress: true,
        observe: 'events',
      })
      .subscribe((event) => {
        if (event.type === HttpEventType.UploadProgress) {
          console.log(
            `Merge Progress: ${
              Math.round((10000 * event.loaded) / event.total) / 100
            }`
          );
        } else if (event.type === HttpEventType.Response) {
          console.log('Merge response: ', event);
          const body: any = event.body;
          const { status, message, chunk, FileInfo } = body;

          // set chunk complete status to true
          // get file chunk
          const file = this.files.find((f) => f.name == FileInfo.name);
          if (file) {
            file.complete = true;
            file.uploaded = file.total;
            file.inprogress = false;
          }
          if (this.onUploadComplete) this.onUploadComplete(this);
        }
      }); // this.http
  }

  UploadFile(seq?: number) {
    if (seq == undefined) seq = 0;
    const fd = new FormData();
    const chunkSize = 1024 * 1024;
    const pos = seq * this.CHUNK_SIZE;

    fd.append('fn', this.selectedFile.name);
    fd.append('seq', `${seq}`);
    fd.append(
      'object',
      this.selectedFile.slice(pos, pos + this.CHUNK_SIZE),
      this.selectedFile.name
    );
    this.http
      // .post('http://soga-alv/ngarbi/api/FileUpload/uploadstream/', fd, {
      .post(this.urlUpload, fd, {
        reportProgress: true,
        observe: 'events',
      })
      .subscribe((event) => {
        if (event.type === HttpEventType.UploadProgress) {
          console.log(
            `Upload Progress: ${
              Math.round((10000 * event.loaded) / event.total) / 100
            }`
          );
        } else if (event.type === HttpEventType.Response) {
          console.log(event);
        }
      });
  }

  Upload(onComplete?: Function) {
    // check status
    if (this.files.length == 0) return;
    if (this.active.length < this.MaximumActiveFiles) {
      for (let idx = 0; idx < this.files.length; idx++) {
        const fi = this.files[idx];
        if (
          !fi.inprogress &&
          !fi.complete &&
          !fi.failed &&
          this.active.indexOf(fi) == -1
        ) {
          this.active.push(fi);
          if (this.active.length == this.MaximumActiveFiles) break;
        }
      }
    }

    const fileToProcess = this.active.find((f) => !f.inprogress && !f.complete);
    if (!fileToProcess) return; // no file to process

    this.onUploadComplete = onComplete;

    // this.active.forEach((f) => {
    // call status check
    fileToProcess.inprogress = true;

    this.UploadChunks(fileToProcess);

    // const fd = this.GetFileInfoParams(fileToProcess);

    // const obs = this.http.post(this.urlStatus, fd, {
    //   reportProgress: true,
    //   observe: 'events',
    // });

    // const subs = obs.subscribe(
    //   (event) => {
    //     if (event.type === HttpEventType.UploadProgress) {
    //       console.log(
    //         `Progress: ${
    //           Math.round((10000 * event.loaded) / event.total) / 100
    //         }`
    //       );
    //     } else if (event.type === HttpEventType.Response) {
    //       const body: any = event.body;
    //       const { FileInfo, status, message, chunks, reupload, deleted } = body;

    //       if (status == 'error') {
    //         // prompt user and stop uploading
    //         console.log('Error checking status: ', message);
    //       } else if (status == 'exists') {
    //         console.log(
    //           `File ${FileInfo ? FileInfo.name : 'unknown'} already exist!`
    //         );
    //         // emit event which checks possible association of the file
    //         // to a table record, then proceed with the next action
    //         // ... probably break from the current iteration, set delete flag then call upload again...
    //         fileToProcess.complete = false;
    //         fileToProcess.inprogress = false;
    //         return;
    //       } else if (chunks) {
    //         // chunks already uploaded, mark all chunks enumerated to
    //         // exclude in processing
    //         const file = this.files.find((f) => f.name == FileInfo.name);
    //         if (file) {
    //           const chkArr = chunks.split(',');
    //           for (let idx = 0; idx < chkArr.length; idx++) {
    //             const chk = file.chunks.find((c) => c.index == +chkArr[idx]);
    //             chk.existing = true;
    //           }
    //         }
    //       } else {
    //       }
    //       console.log('Response: ', event, '\nbody: ', body);
    //       this.UploadChunks(FileInfo);
    //       // this.UploadFile(1);
    //     }
    //   },
    //   (err) => {
    //     console.log('Error: ', err);
    //   },
    //   () => {
    //     console.log('Complete checking: ', fileToProcess);
    //     subs.unsubscribe();
    //   }
    // );
    // });
  }

  UploadX() {
    // check status
    if (this.files.length == 0) return;
    if (this.active.length < this.MaximumActiveFiles) {
      for (let idx = 0; idx < this.files.length; idx++) {
        const fi = this.files[idx];
        if (
          !fi.inprogress &&
          !fi.complete &&
          !fi.failed &&
          this.active.indexOf(fi) == -1
        ) {
          this.active.push(fi);
          if (this.active.length == this.MaximumActiveFiles) break;
        }
      }
    }

    const fileToProcess = this.active.find((f) => !f.inprogress && !f.complete);
    if (!fileToProcess) return; // no file to process

    // this.active.forEach((f) => {
    // call status check
    fileToProcess.inprogress = true;
    const fd = this.GetFileInfoParams(fileToProcess);

    // fd.append('reupload', 'true');
    // fd.append('overwrite', 'true');

    const obs = this.http.post(this.urlStatus, fd, {
      reportProgress: true,
      observe: 'events',
    });

    const subs = obs.subscribe(
      (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          console.log(
            `Progress: ${
              Math.round((10000 * event.loaded) / event.total) / 100
            }`
          );
        } else if (event.type === HttpEventType.Response) {
          const body: any = event.body;
          const { FileInfo, status, message, chunks, reupload, deleted } = body;

          if (status == 'error') {
            // prompt user and stop uploading
            console.log('Error checking status: ', message);
          } else if (status == 'exists') {
            console.log(
              `File ${FileInfo ? FileInfo.name : 'unknown'} already exist!`
            );
            // emit event which checks possible association of the file
            // to a table record, then proceed with the next action
            // ... probably break from the current iteration, set delete flag then call upload again...
            fileToProcess.complete = false;
            fileToProcess.inprogress = false;
            return;
          } else if (chunks) {
            // chunks already uploaded, mark all chunks enumerated to
            // exclude in processing
            const file = this.files.find((f) => f.name == FileInfo.name);
            if (file) {
              const chkArr = chunks.split(',');
              for (let idx = 0; idx < chkArr.length; idx++) {
                const chk = file.chunks.find((c) => c.index == +chkArr[idx]);
                chk.existing = true;
              }
            }
          } else {
          }
          console.log('Response: ', event, '\nbody: ', body);
          this.UploadChunks(FileInfo);
          // this.UploadFile(1);
        }
      },
      (err) => {
        console.log('Error: ', err);
      },
      () => {
        console.log('Complete checking: ', fileToProcess);
        subs.unsubscribe();
      }
    );
    // });
  }
}
