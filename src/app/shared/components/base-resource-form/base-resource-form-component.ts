import { OnInit, AfterContentChecked, Injector, Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { BaseResourceModel } from "../../models/base-resource.model"
import { BaseResourceService } from "../../services/base-resource.service"

import { switchMap } from "rxjs/operators";

import toastr from "toastr";

@Component({
  template: ''
})

export abstract class BaseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked{
  
  currentAction: string;
  resourceForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;

  protected route: ActivatedRoute;
  protected router: Router;
  protected formBuilder: FormBuilder;

  constructor(
    protected injector: Injector,
    @Inject(String) public resource: T,
    protected resourceService: BaseResourceService<T>,
    @Inject(String) protected jsonDataToResourceFn: (jsonData) => T
  ) { 
    this.route = this.injector.get(ActivatedRoute);
    this.router = this.injector.get(Router);
    this.formBuilder = this.injector.get(FormBuilder);
  }

  ngOnInit() {
    this.setCurrentAction();
    this.buildResourceForm();
    this.loadResource();
  }

  ngAfterContentChecked(){
    this.setPageTitle();
  }

  submitForm(){
    this.submittingForm = true;

    if(this.currentAction == "new")
      this.createResource();
    else
      this.updateResource();
  }
  
  protected setCurrentAction() {
    if(this.route.snapshot.url[0].path == "new")
      this.currentAction = "new"
    else
      this.currentAction = "edit"
  }

  protected loadResource() {
    if (this.currentAction == "edit") {
      this.route.paramMap.pipe(
        switchMap(params => this.resourceService.getById(+params.get("id")))
      )
      .subscribe({
        next: (resource) => {
          this.resource = resource
          this.resourceForm.patchValue(resource)
        },
        error: (error) => {
          alert('Ocorreu um erro no servidor, tente mais tarde.')
          console.log(error)
        }
      })
    }
  }

  protected setPageTitle() {
    if (this.currentAction == 'new')
      this.pageTitle = this.creationPageTitle();
    else{
      this.pageTitle = this.editionPageTitle();
    }
  }

  protected creationPageTitle(): string{
    return "Novo"
  }

  protected editionPageTitle(): string{
    return "Edi????o"
  }

  protected createResource(){
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value); 
    this.resourceService.create(resource)
      .subscribe({
        next:() => this.actionsForSuccess(resource),
        error: (error) => this.actionsForError(error)
      })
  }

  protected updateResource(){
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);

    this.resourceService.update(resource)
      .subscribe({
        next: () => this.actionsForSuccess(resource),
        error: (error) => this.actionsForError(error)
      })
  }

  
  protected actionsForSuccess(resource: T){
    toastr.success("Solicita????o processada com sucesso!");
    const baseComponentPath: string = this.route.snapshot.parent.url[0].path;
    this.router.navigateByUrl(baseComponentPath, {skipLocationChange: true}).then(
      () => this.router.navigate([baseComponentPath, resource.id, "edit"])
    )
  }

  protected actionsForError(error){
    toastr.error("Ocorreu um erro ao processar a sua solicita????o!");
    this.submittingForm = false;
    if(error.status === 422)
      this.serverErrorMessages = JSON.parse(error._body).errors;
    else
      this.serverErrorMessages = ["Falha na comunica????o com o servidor. Por favor, tente mais tarde."]
  }

  protected abstract buildResourceForm(): void;
}
