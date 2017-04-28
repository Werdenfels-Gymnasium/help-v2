import {Component} from '@angular/core';
import {Instructions} from '../../services/instructions.service';

@Component({
  selector: 'sidebar-content',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  constructor(instructions: Instructions) {}

}
