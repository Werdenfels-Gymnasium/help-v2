import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {HomeComponent} from './components/home/home.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent }
];

export const AppRoutingModule = RouterModule.forRoot(appRoutes);
