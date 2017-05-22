import {Routes, RouterModule} from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {GuideComponent} from './components/guide/guide.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'guides/:id', component: GuideComponent }
];

export const AppRoutingModule = RouterModule.forRoot(appRoutes);
