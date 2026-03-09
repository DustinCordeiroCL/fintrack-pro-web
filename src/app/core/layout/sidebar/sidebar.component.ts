import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface NavItem {
    label: string;
    icon: string;
    route: string;
}

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [RouterModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
    readonly linkActiveOptions = { exact: true };
    
    readonly navItems: NavItem[] = [
        { label: 'Dashboard', icon: 'pi pi-chart-bar', route: '/dashboard' },
        { label: 'Transactions', icon: 'pi pi-arrows-h', route: '/transactions' },
        { label: 'Categories', icon: 'pi pi-tag', route: '/categories' }
    ];
}