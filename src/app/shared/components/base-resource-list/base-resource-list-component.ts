import { Component, Inject, OnInit } from "@angular/core";
import { BaseResourceModel } from "../../models/base-resource.model";
import { BaseResourceService } from "../../services/base-resource.service";

@Component({
  template: ''
})

export abstract class BaseResourceListComponent<T extends BaseResourceModel> implements OnInit {
  resources: T[] = [];

  constructor(
    @Inject(String) private resourceService: BaseResourceService<T>
  ) { }

  ngOnInit() {
    this.resourceService.getAll().subscribe({
      next: (resources) => (this.resources = resources.sort((a, b) => b.id - a.id)),
      error: (error) => {
        alert('Erro ao carregar a lista')
        console.log(error)
      }
    });
  }

  deleteResource(resource: T) {
    const mustDelete = confirm('Deseja realmente excluir este item?');
    if (mustDelete) {
      this.resourceService.delete(resource.id).subscribe({
        next: () => {
          (this.resources = this.resources.filter(
            (element) => element != resource
          ))
        },
        error: (error) => {
          alert('Erro ao tentar excluir!')
          console.log(error)
        }
      }
      );
    }
  }
}
