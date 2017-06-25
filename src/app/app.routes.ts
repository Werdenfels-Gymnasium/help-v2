import {Routes, RouterModule} from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {GuideComponent} from './components/guide/guide.component';
import {NotFoundComponent} from './components/not-found/not-found.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'guides/:id', component: GuideComponent },
  { path: '**', component: NotFoundComponent }
];

export const AppRoutingModule = RouterModule.forRoot(appRoutes);
