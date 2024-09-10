import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { take } from 'rxjs/operators';
import { IssuesService } from 'src/app/core/services/issues.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
// import { LoadingService } from 'src/app/shared/services/loading.service';

@Component({
  selector: 'app-sidebar-issue-allocate',
  templateUrl: './sidebar-issue-allocate.component.html',
  styleUrls: ['./sidebar-issue-allocate.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SidebarIssueAllocateComponent implements OnInit {
  @Input() showSidebar = false;
  @Input() operators;
  @Input() paramsConfig: {
    occurrence_id;
    isReallocate;
    atualOperator;
    occurrence;
    operators;
    sector;
    created;
  };
  @Output() hideSidebar = new EventEmitter();
  @Output() onAllocate = new EventEmitter();

  selectedOperator: any;
  token: any;
  operator_id: any;

  constructor(
    private issuesService: IssuesService,
    private loadingService: LoadingService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.issuesService
      .auth()
      .pipe(take(1))
      .subscribe((res: any) => {
        this.token = res.access_token;
        this.operator_id = res.operator_id;
      });
  }

  assignOperator() {
    this.loadingService.loadingOn();

    if (this.operator_id == this.selectedOperator) {
      const payload = {
        issue_id: this.paramsConfig.occurrence_id,
      };

      this.issuesService
        .assignIssueToMe(this.paramsConfig.occurrence_id, this.token)
        .pipe(take(1))
        .subscribe({
          next: (res) => {
            this.loadingService.loadingOff();
            this.messageService.add({
              severity: 'success',
              summary: this.paramsConfig.isReallocate
                ? 'Ocorrência reatribuída!'
                : 'Ocorrência atribuída!',
            });
            this.closeSidebar();
            this.onAllocate.emit(true);
          },
          error: (res) => {
            this.loadingService.loadingOff();
            this.messageService.add({
              severity: 'error',
              summary: res.error.message,
            });
          },
        });
    } else {
      const payload = {
        issue_id: this.paramsConfig.occurrence_id,
        operator_id: this.selectedOperator,
        comment: 'Atribuição de operador via tela de Gestor de operação',
      };
      this.issuesService
        .assignIssueToOperator(payload, this.token)
        .pipe(take(1))
        .subscribe({
          next: (res) => {
            this.loadingService.loadingOff();
            this.messageService.add({
              severity: 'success',
              summary: this.paramsConfig.isReallocate
                ? 'Ocorrência reatribuída!'
                : 'Ocorrência atribuída!',
            });
            this.closeSidebar();
            this.onAllocate.emit(true);
          },
          error: (res) => {
            this.loadingService.loadingOff();
            this.messageService.add({
              severity: 'error',
              summary: res.error.message,
            });
          },
        });
    }
  }

  // deleteFilter(filter, index) {
  //   this.confirmationService.confirm({
  //     message: `Tem certeza que deseja excluir o filtro salvo <b>${filter.name}</b>?`,
  //     header: `Tem certeza?`,
  //     icon: 'pi pi-exclamation-triangle',
  //     acceptLabel: 'Sim',
  //     acceptButtonStyleClass: 'packk',
  //     rejectButtonStyleClass: 'packk',
  //     rejectLabel: 'Não',
  //     accept: () => {
  //       this.loadingService.loadingOn();
  //       this.reportService
  //         .deleteFilter(filter.filter_name, filter.id)
  //         .pipe(take(1))
  //         .subscribe({
  //           next: () => {
  //             this.userFilters.splice(index, 1);
  //             this.loadingService.loadingOff();
  //           },
  //           error: () => this.loadingService.loadingOff(),
  //         });
  //     },
  //   });
  // }

  closeSidebar() {
    this.selectedOperator = null;
    this.hideSidebar.emit(true);
  }
}
