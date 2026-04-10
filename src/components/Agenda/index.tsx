import { useState } from "react";
import { useStore } from "../../store";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  DollarSign,
  Zap,
  X,
  Zap as ZapIcon,
} from "lucide-react";

const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function Agenda() {
  const { clientes, ucs } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

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

  // Busca UCs que vencem no dia especificado
  const getUCsForDay = (day: number) => {
    return ucs.filter((uc) => {
      const vencimentoDia = parseInt(uc.data_vencimento, 10);
      return vencimentoDia === day;
    });
  };

  // Pega todas as UCs que vencem neste mês
  const ucsDoMes = ucs.filter((uc) => {
    const vencimentoDia = parseInt(uc.data_vencimento, 10);
    return vencimentoDia > 0 && vencimentoDia <= daysInMonth;
  });

  const totalUCsMes = ucsDoMes.length;
  const ucsGeradoras = ucsDoMes.filter(
    (uc) => uc.tipo_uc === "Geradora",
  ).length;
  const ucsBeneficiarias = ucsDoMes.filter(
    (uc) => uc.tipo_uc === "Beneficiária",
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Agenda de UC's
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Visualize as UC's por data de vencimento
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalUCsMes}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                UC's no mês
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {ucsGeradoras}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Geradoras
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
              <Zap className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {ucsBeneficiarias}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Beneficiárias
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {ucs.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total de UC's
              </p>
            </div>
          </div>
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
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div
              key={day}
              className="p-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="min-h-[100px] p-2 border-b border-r border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30"
            />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dayUCs = getUCsForDay(day);
            const isToday =
              day === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            return (
              <div
                key={day}
                onClick={() => dayUCs.length > 0 && setSelectedDay(day)}
                className={`min-h-[100px] p-2 border-b border-r border-gray-100 dark:border-gray-700 ${
                  isToday ? "bg-emerald-50 dark:bg-emerald-900/20" : ""
                } ${dayUCs.length > 0 ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50" : ""}`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isToday
                      ? "h-6 w-6 flex items-center justify-center rounded-full bg-emerald-500 text-white"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {day}
                </div>
                <div className="space-y-1">
                  {dayUCs.slice(0, 3).map((uc) => {
                    const cliente = clientes.find(
                      (c) => c.id === uc.cliente_id,
                    );
                    return (
                      <div
                        key={uc.id}
                        className={`text-xs p-1 rounded truncate ${
                          uc.tipo_uc === "Geradora"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                        }`}
                        title={`${cliente?.nome} - UC ${uc.numero_uc}`}
                      >
                        {cliente?.nome?.split(" ")[0]} - {uc.numero_uc}
                      </div>
                    );
                  })}
                  {dayUCs.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                      +{dayUCs.length - 3} mais
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
          <div className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-900/30" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Geradoras
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-teal-100 dark:bg-teal-900/30" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Beneficiárias
          </span>
        </div>
      </div>

      {/* Modal de UCs do dia */}
      {selectedDay !== null && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                UC's para extrair - {selectedDay} de {meses[month]}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1">
              <div className="p-6 space-y-4">
                {getUCsForDay(selectedDay).map((uc) => {
                  const cliente = clientes.find((c) => c.id === uc.cliente_id);
                  return (
                    <div
                      key={uc.id}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {uc.numero_uc}
                            </h4>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                uc.tipo_uc === "Geradora"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                              }`}
                            >
                              {uc.tipo_uc}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            {cliente?.nome}
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">
                                Distribuidora
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {uc.distribuidora}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">
                                Estado
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {uc.estado}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">
                                Classe
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {uc.classe}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">
                                Mercado
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {uc.mercado}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 text-white px-4 py-2 font-medium hover:bg-emerald-600 transition-colors">
                            <ZapIcon className="h-4 w-4" />
                            Extrair
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 dark:border-gray-700 p-6 flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total: {getUCsForDay(selectedDay).length} UC
                {getUCsForDay(selectedDay).length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={() => setSelectedDay(null)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
