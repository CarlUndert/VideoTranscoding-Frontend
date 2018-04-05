import { Component, OnInit, Input } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { MediaService } from '../../shared/services/media.service';
import { Original } from '../../shared/models/original.model';
import * as globals from '../../globals';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { Conversion } from '../../shared/models/conversion.model';
import { VgAPI } from 'videogular2/core';
import { ActivatedRoute } from '@angular/router';

export interface CurrentItem {
  video: any;
  src: string;

}
@Component({
  selector: 'app-watch-video',
  templateUrl: './watch-video.component.html',
  styleUrls: ['./watch-video.component.scss'],
  animations: [routerTransition()]

})
export class WatchVideoComponent implements OnInit {
  conversions: Conversion[] = [];
  originalVideo: Original = { active: false, complete: true, conversions: this.conversions, originalId: 0, fileSize: "2", name: "", path: "", userVideo: null };
  currentItemWatching: CurrentItem = { video: null, src: "" };
  api: VgAPI;
  canEvaluate: boolean;
  originalIdRedirect: number;
  @Input() watchId: number;
  constructor(private activatedRoute: ActivatedRoute, private mediaService: MediaService, private ng4LoadingSpinnerService: Ng4LoadingSpinnerService) {
    this.ng4LoadingSpinnerService.show();
    this.watchId = activatedRoute.snapshot.queryParams['idWatch'];
    this.originalIdRedirect = activatedRoute.snapshot.params['id'];
  }
  onPlayerReady(api: VgAPI) {
    this.api = api;
  }
  ngOnInit() {
    if (this.originalIdRedirect == undefined) {
      //LANZAR NOT FOUND
      console.log("No se ha encontrado original ID, no has sido rederigido correctamente")
    }
    this.getOriginal();
  }
  getOriginal() {
    this.mediaService.getOriginalById(this.originalIdRedirect).subscribe(
      result => {
        this.originalVideo = result;
        if (this.watchId != this.originalVideo.originalId) {
          this.currentItemWatching.video = this.originalVideo.conversions.find(element => element.conversionId == this.watchId);
        }
        else {
          this.currentItemWatching.video = result;
        }
        this.currentItemWatching.src = this.getVideoUrl(this.currentItemWatching.video);
        this.canEvaluate=true;
        this.ng4LoadingSpinnerService.hide();
      },
      error => {
        console.log(error);
        this.ng4LoadingSpinnerService.hide();
      }
    )
  }

  getVideoUrl(video: any) {
    if (this.currentItemWatching.video.conversionId != undefined) {
      return globals.WATCH_URL + this.currentItemWatching.video.conversionId;
    }
    return globals.WATCH_URL + this.currentItemWatching.video.originalId;
  }
  changeSource(newConversionId: number) {
    if (newConversionId != this.originalVideo.originalId) {
      this.currentItemWatching.video = this.originalVideo.conversions.find(element => element.conversionId == newConversionId);
    }
    else {
      this.currentItemWatching.video = this.originalVideo;
    }
    this.currentItemWatching.src = this.getVideoUrl(this.currentItemWatching.video);

  }


}