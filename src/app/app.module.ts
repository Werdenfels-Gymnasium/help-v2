import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {MdCardModule, MdListModule, MdSidenavModule, MdToolbarModule} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AngularFireModule} from 'angularfire2';
import {AngularFireDatabaseModule} from 'angularfire2/database';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app.routes';
import {HomeComponent} from './components/home/home.component';
import {SidebarComponent} from './components/sidebar/sidebar.component';
import {Backend} from './services/backend.service';
import {environment} from '../environments/environment';

@NgModule({
  exports: [
    BrowserAnimationsModule,
    MdToolbarModule,
    MdSidenavModule,
    MdCardModule,
    MdListModule
  ]
})
export class AppMaterialModule {}

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    HomeComponent
  ],
  entryComponents: [
    HomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AppRoutingModule,
    AppMaterialModule,
  ],
  providers: [Backend],
  bootstrap: [AppComponent]
})
export class AppModule { }
