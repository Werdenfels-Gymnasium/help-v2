import {Component} from '@angular/core';
import {Backend, GuideData} from '../../services/backend.service';
import {FirebaseListObservable} from 'angularfire2/database';

@Component({
  selector: 'sidebar-content',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  guides: FirebaseListObservable<GuideData[]>;

  constructor(backend: Backend) {
    this.guides = backend.guides;
  }

}
