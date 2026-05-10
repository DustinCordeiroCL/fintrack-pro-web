import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';

type HeroMetric = {
  label: string;
  value: string;
  tone: 'neutral' | 'positive' | 'negative';
};

type FeatureCard = {
  icon: string;
  title: string;
  description: string;
};

type TimelineItem = {
  title: string;
  category: string;
  amount: string;
  tone: 'positive' | 'negative';
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  readonly #authService = inject(AuthService);

  readonly isAuthenticated = computed(() => this.#authService.isAuthenticated());

  readonly heroMetrics: HeroMetric[] = [
    { label: 'Ingresos del mes', value: '$4.820.000', tone: 'positive' },
    { label: 'Gastos del mes', value: '$2.145.000', tone: 'negative' },
    { label: 'Saldo actual', value: '$2.675.000', tone: 'neutral' }
  ];

  readonly featureCards: FeatureCard[] = [
    {
      icon: 'pi pi-chart-line',
      title: 'Visão clara do dinheiro do mês',
      description: 'Acompanhe entradas, saídas e saldo em um painel que convida ao uso diário.'
    },
    {
      icon: 'pi pi-tags',
      title: 'Categorias que explicam seus hábitos',
      description: 'Entenda para onde o dinheiro está indo sem depender de planilhas espalhadas.'
    },
    {
      icon: 'pi pi-history',
      title: 'Histórico que vira rotina',
      description: 'Revise compras, assinaturas e receitas recentes com contexto suficiente para decidir rápido.'
    }
  ];

  readonly timeline: TimelineItem[] = [
    { title: 'Salário', category: 'Receita fixa', amount: '+ $3.800.000', tone: 'positive' },
    { title: 'Supermercado', category: 'Casa', amount: '- $182.900', tone: 'negative' },
    { title: 'Projeto freelance', category: 'Receita extra', amount: '+ $620.000', tone: 'positive' },
    { title: 'Assinaturas', category: 'Serviços', amount: '- $64.900', tone: 'negative' }
  ];
}
