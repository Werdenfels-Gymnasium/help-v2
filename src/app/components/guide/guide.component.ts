import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AngularFireDatabase, FirebaseObjectObservable} from 'angularfire2/database';
import {GuideData} from '../../services/backend.service';

@Component({
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.scss']
})
export class GuideComponent {

  guideData: FirebaseObjectObservable<GuideData>;

  constructor(private route: ActivatedRoute, private firebase: AngularFireDatabase) {
    this.route.params.subscribe(params => {
      this.guideData = this.firebase.object(`guides/${params['id']}`);
    });
  }

}
