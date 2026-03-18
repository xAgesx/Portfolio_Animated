import { Routes } from '@angular/router';
import { Animated } from './animated/animated';
import { Carousel } from './carousel/carousel';
import { Carousel3D } from './carousel3-d/carousel3-d';


export const routes: Routes = [{
    
    path:"",component:Carousel
    
},{
    path:"main",component:Animated
}
];
