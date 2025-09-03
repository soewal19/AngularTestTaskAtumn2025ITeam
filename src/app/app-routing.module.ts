import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EngineerFormComponent } from './engineer-form/engineer-form.component';

const routes: Routes = [
  {
    path: '',
    component: EngineerFormComponent,
    pathMatch: 'full'
  },
  // Add more routes here if needed in the future
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
