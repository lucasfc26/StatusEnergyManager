import { useState } from 'react';
import { useStore } from '../../store';
import { Calendar, ChevronLeft, ChevronRight, FileText, DollarSign } from 'lucide-react';

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function Agenda() {
  const { clientes, faturas } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getFaturasForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return faturas.filter(f => f.data_vencimento === dateStr);
  };

  const totalFaturasMes = faturas.filter(f => {
    const faturaDate = new Date(f.data_vencimento);
    return faturaDate.getMonth() === month && faturaDate.getFullYear() === year;
  });

  const valorTotalMes = totalFaturasMes.reduce((acc, f) => acc + f.valor_total, 0);
  const faturasPendentes = totalFaturasMes.filter(f => f.status === 'Pendente').length;
  const faturasPagas = totalFaturasMes.filter(f => f.status === 'Paga').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agenda de Faturas</h1>
        <p className="text-gray-500 dark:text-gray-400">Visualize as faturas por data de vencimento</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalFaturasMes.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Faturas no mês</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                R$ {valorTotalMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Valor total</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-2xl font-bold text-yellow-600">{faturasPendentes}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pendentes</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-2xl font-bold text-green-600">{faturasPagas}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pagas</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <button
            onClick={prevMonth}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-500" />
            {meses[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="p-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="min-h-[100px] p-2 border-b border-r border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dayFaturas = getFaturasForDay(day);
            const isToday = 
              day === new Date().getDate() && 
              month === new Date().getMonth() && 
              year === new Date().getFullYear();

            return (
              <div
                key={day}
                className={`min-h-[100px] p-2 border-b border-r border-gray-100 dark:border-gray-700 ${
                  isToday ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday 
                    ? 'h-6 w-6 flex items-center justify-center rounded-full bg-emerald-500 text-white' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayFaturas.slice(0, 3).map((fatura) => {
                    const cliente = clientes.find(c => c.id === fatura.cliente_id);
                    return (
                      <div
                        key={fatura.id}
                        className={`text-xs p-1 rounded truncate ${
                          fatura.status === 'Paga' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : fatura.status === 'Pendente'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : fatura.status === 'Extraída'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                        title={`${cliente?.nome} - R$ ${fatura.valor_total.toFixed(2)}`}
                      >
                        {cliente?.nome?.split(' ')[0]} - R${fatura.valor_total.toFixed(0)}
                      </div>
                    );
                  })}
                  {dayFaturas.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                      +{dayFaturas.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Paga</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-900/30" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Extraída</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-100 dark:bg-yellow-900/30" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Pendente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/30" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Erro</span>
        </div>
      </div>
    </div>
  );
}
