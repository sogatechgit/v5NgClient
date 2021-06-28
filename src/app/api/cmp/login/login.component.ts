import { AppMainServiceService } from './../../../svc/app-main-service.service';
import { IUserInfo } from './../../mod/app-common.classes';
import {
  AppDataset,
  UserParamLookupGroup,
} from './../../../svc/app-dataset.service';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
  Input,
} from '@angular/core';
import { RequestParams } from '../../mod/app-params.model';
import { Console } from 'node:console';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('USER_NAME') USER_NAME: ElementRef;
  @ViewChild('PWD') PWD: ElementRef;

  @Input() data: any;

  constructor(public dataSource: AppMainServiceService) {}

  public form: FormGroup = new FormGroup({});
  public msgInvalidUser: string = null;
  public msgInvalidPassword: string = null;

  get ds(): AppDataset {
    if (!this.data) return null;
    return this.data.DataSet;
  }

  get UserInfo(): IUserInfo {
    if (!this.ds) return null;
    return this.ds.userInfo;
  }

  get validUser(): boolean {
    const ctrl: AbstractControl = this.form.get('USER_NAME');
    return !this.msgInvalidUser;
  }
  get validPassword(): boolean {
    const ctrl: AbstractControl = this.form.get('USER_PASSWORD');
    return !this.msgInvalidPassword;
  }

  ngOnInit(): void {
    if (this.UserInfo) {
      // force credential initialization if the user is not authenticated.
      if (!this.ds.isAuthenticated) this.ds.Logout();
    }

    this.form.addControl('USER_NAME', new FormControl());
    this.form.addControl('USER_PASSWORD', new FormControl());



    this.TestDataAccess()
  }


  TestDataAccess(){

    const prms: RequestParams = new RequestParams({
      // code:'an',
      // fields:'AN_ID`AN_TITLE',
      // filter: `{AN_ID|1}`,
      code:'users|-param,USER_ID,USER_PARAM_USER_ID`param@p2,USER_PARAM_USER_ID,USER_PARAM_USER_ID;',
      fields:'USER_ID`USER_NAME`USER_PREFERENCES`USER_UPDATE_DATE`PARAM_TEXT@login`p2.PARAM_TEXT@pwd',
      // filter: `({PARAM_TEXT|"alv"}^{PARAM_ID|8000})^{p2.PARAM_ID|8002}`,
      filter: `{PARAM_ID|8000}`,
      snap: true,
    });

    setTimeout(() => {
      this.ds.Get([prms], {
        onSuccess: (data) => {
          console.log("Test data success: " , data)
        },
        onError: (err) => {
          console.log("Test data error: " ,err);
        },
      });
    }, 500); // set timeout end


  }

  ngAfterViewInit() {
    this.Focus();
  }


  Focus(onPassword?: boolean) {
    setTimeout(() => {
      if (onPassword) {
        if (this.PWD) this.PWD.nativeElement.focus();
      } else {
        if (this.USER_NAME) this.USER_NAME.nativeElement.focus();
      }
    }, 30);
  }

  InitParent() {
    if (!this.data) return;
    if (!this.data.parent) return;
    if (!this.data.parent.InitComponent) return;

    setTimeout(() => this.data.parent.InitComponent(), 0);
  }

  get msgLogin(): string {
    return this.loggingIn ? 'Logging in. Please wait.' : 'Login';
  }

  public loggingIn: boolean = false;
  Login() {
    if (!this.ds) this.ds.cl('Dataset not supplied!');

    const user: string = this.form.get('USER_NAME').value;
    const pwd: string = this.form.get('USER_PASSWORD').value;

    if (!user) this.msgInvalidUser = 'Please enter your login id';
    if (!pwd) this.msgInvalidPassword = 'Password is required';

    if (!this.ds || !user || !pwd) {
      this.Focus();
      return;
    }

    const LPG = UserParamLookupGroup;

    this.loggingIn = true;
    const prms: RequestParams = new RequestParams({
      code:
        'users|-param,USER_ID,USER_PARAM_USER_ID`param@p2,USER_PARAM_USER_ID,USER_PARAM_USER_ID;',
      fields:
        'USER_ID`USER_NAME`USER_PREFERENCES`USER_UPDATE_DATE`PARAM_TEXT@login`p2.PARAM_TEXT@pwd',
      filter: `({PARAM_TEXT|"${user}"}^{PARAM_ID|${LPG.Login}})^{p2.PARAM_ID|${LPG.Password}}`,
      snap: true,
    });

    setTimeout(() => {
      console.log("Login params: ",prms);
      this.ds.Get([prms], {
        onSuccess: (data) => {
          console.log("LoginData: " ,data)
          this.loggingIn = false;
          // if(data.processed.data)
          let isValidUser: boolean = false;
          let rec: any;

          if (data.processed.data[0].length) {
            // record found

            rec = data.processed.data[0][0];

            const upwd = rec.XTRA.PWD;



            if (upwd === pwd) {
              console.log('User Authenticatd!!');
              isValidUser = true;
            } else {
              this.msgInvalidPassword = 'Invalid password!';
            }
          } else {
            this.msgInvalidUser = `User "${user}" not found!`;
            console.log('Not a registered user!!');
          }

          if (isValidUser) {
            this.ds.isAuthenticated = true;
            this.UserInfo.id = user;
            this.UserInfo.name = rec.USER_NAME;
            this.UserInfo.logged = true;

            localStorage.setItem('userInfo', JSON.stringify(this.UserInfo));
            // localStorage.remove;

            this.ds.cl(['Login', prms,'Data', data]);

            this.InitParent();
          } else {
            this.Focus(this.msgInvalidPassword.length != 0);
          }
        },
        onError: (err) => {
          console.log(err);
          this.Focus();
        },
      });
    }, 500); // set timeout end
  }

  ForgotPassword(e: any) {
    this.ds.openSnackBar(
      "Sorry. 'Forgot password' facility is still under development.",
      'x',
      3000
    );
  }
  Register(e: any) {
    this.ds.openSnackBar(
      'Sorry. User registration facility is still under development.',
      'x',
      3000
    );
  }
  OnChange(e: any) {
    const name = e.getAttribute('formControlName');
    const value = e.value;
    const ctrl = this.form.get(name);
    if (name == 'USER_NAME' && value.length != 0) this.msgInvalidUser = '';
    if (name == 'USER_PASSWORD' && value.length != 0)
      this.msgInvalidPassword = '';
  }

  onKeyUp(e: any) {
    if (e.key == 'Enter') {
      this.ds.cl(['onKeyUp: ', e]);
      const id = e.target.id;
      if (id == 'pwd') {
        this.Login();
      } else if (id == 'user') {
        // go to password field
        this.Focus(true);
      }
    }
  }
}
