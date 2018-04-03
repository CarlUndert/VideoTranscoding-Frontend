import { Component, OnDestroy, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { MediaService } from '../../shared/services/media.service';
import { Original } from '../../shared/models/original.model';
import { Conversion } from '../../shared/models/conversion.model';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { Observable, Subscription } from 'rxjs/Rx';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [routerTransition()]
})
export class DashboardComponent implements OnInit, OnDestroy {
    originalVideos: Array<Original> = [];
    originalOnProgress: Original = { originalId: 0, name: "", path: "", userVideo: null, fileSize: "", conversions: null, complete: false, active: false };
    conversionsConverted: Array<Conversion> = [];
    conversionOnProgress: Conversion;
    onConversion: boolean = false;
    loading: boolean = false;

    interval: Subscription = undefined;

    constructor(private mediaService: MediaService, private ng4LoadingSpinnerService: Ng4LoadingSpinnerService) {
    }

    ngOnInit() {
        this.ng4LoadingSpinnerService.show();
        this.loading = true;
        this.getAllMedia();
    }

    getAllMedia() {
        console.log("Realizando peticion para todos los objetos ")
        this.mediaService.getAllMedia().subscribe(
            result => {
                this.originalVideos = result;
                this.getOnProgress();
            },
            error => {
                console.log(error);
                this.ng4LoadingSpinnerService.hide();
                this.loading = false;
            })
    }
    getOnProgress(): any {
        for (let element of this.originalVideos) {
            console.log("Comparando objeto: " + element.name + " y su valor es: " + element.active)
            if (element.active == true) {
                console.log("Conversion Activa: " + element.originalId)
                this.originalOnProgress = element;
                this.onConversion = true;
                this.updateOnConversion();
                return null;
            }
        }
        if (this.originalOnProgress.originalId == 0) {
            this.ng4LoadingSpinnerService.hide();
            this.loading = false;
        }
        if (this.interval == undefined) {
            this.interval = Observable.interval(60000).subscribe(x => {
                this.ngOnInit();
            });
        }
    }
    updateOnConversion() {
        console.log("Realizando peticion de un solo objeto");
        if (this.originalOnProgress.active) {
            this.mediaService.getOriginalById(this.originalOnProgress.originalId).subscribe(
                result => {
                    this.onConversion = true;
                    this.originalOnProgress = result;
                    this.conversionsConverted = [];
                    this.originalOnProgress.conversions.forEach(
                        conversion => {
                            if (conversion.active == true) {
                                this.ng4LoadingSpinnerService.hide();
                                this.loading = false;
                                this.conversionOnProgress = conversion;
                            }
                            if (conversion.finished == true) {
                                this.conversionsConverted.push(conversion);
                            }
                        })

                    if (this.interval == undefined) {
                        this.interval = Observable.interval(2000).subscribe(x => {
                            this.updateOnConversion();
                        });
                    }
                },
                error => console.log(error)
            );
        }
        if (this.originalOnProgress.complete == true) {
            this.interval = undefined;
            this.onConversion = false;
            this.loading = true;
            this.originalOnProgress = { originalId: 0, name: "", path: "", userVideo: null, fileSize: "", conversions: null, complete: false, active: false };
            this.ngOnInit();
        }

    }

    ngOnDestroy() {
        if (this.interval != undefined) {
            this.interval.unsubscribe();
        }
    }

}
