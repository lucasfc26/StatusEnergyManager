import { useState, useEffect } from "react";
import { useStore } from "../../store";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle,
  X,
  Clock,
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

type StatusUC = "extraido" | "pendente" | "urgencia";

export function Agenda() {
  const { clientes, ucs, faturas, fetchUCs, fetchClientes, fetchFaturas } =
    useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    fetchUCs();
    fetchClientes();
    fetchFaturas();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getStatusUC = (ucId: string, diaLeitura: number): StatusUC => {
    const mesRef = `${month + 1}/${year}`;
    const faturaExiste = faturas.some(
      (f) => f.uc_id === ucId && f.mes_referencia === mesRef,
    );
    if (faturaExiste) return "extraido";

    const today = new Date();
    const isCurrentMonth =
      today.getMonth() === month && today.getFullYear() === year;

    if (isCurrentMonth && today.getDate() > diaLeitura) return "urgencia";
    return "pendente";
  };

  const getUCsForDay = (day: number) => {
    return ucs.filter((uc) => {
      const dia = parseInt(uc.data_leitura, 10);
      return !isNaN(dia) && dia === day;
    });
  };

  const ucsComLeitura = ucs.filter((uc) => {
    const dia = parseInt(uc.data_leitura, 10);
    return !isNaN(dia) && dia >= 1 && dia <= 31;
  });

  const totalUCsMes = ucsComLeitura.length;
  const ucExtraidas = ucsComLeitura.filter(
    (uc) => getStatusUC(uc.id, parseInt(uc.data_leitura, 10)) === "extraido",
  ).length;
  const ucPendentes = ucsComLeitura.filter(
    (uc) => getStatusUC(uc.id, parseInt(uc.data_leitura, 10)) === "pendente",
  ).length;
  const ucUrgencia = ucsComLeitura.filter(
    (uc) => getStatusUC(uc.id, parseInt(uc.data_leitura, 10)) === "urgencia",
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Agenda de Leituras
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Leituras das UCs por dia do mês
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUCsMes}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">UCs com leitura</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{ucExtraidas}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Extraídas</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{ucPendentes}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pendentes</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{ucUrgencia}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Urgência</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
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

        <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
            <div
              key={d}
              className="p-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase"
            >
              {d}
            </div>
          ))}
        </div>

        {ucs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">Nenhuma UC cadastrada com data de leitura.</p>
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="min-h-[100px] border-b border-r border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30"
              />
            ))}

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
                  className={`min-h-[100px] p-2 border-b border-r border-gray-100 dark:border-gray-700 flex flex-col ${
                    isToday ? "bg-emerald-50 dark:bg-emerald-900/20" : ""
                  } ${dayUCs.length > 0 ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50" : ""}`}
                >
                  <span
                    className={`text-sm font-medium self-start mb-1 ${
                      isToday
                        ? "h-6 w-6 flex items-center justify-center rounded-full bg-emerald-500 text-white"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {day}
                  </span>
                  <div className="flex flex-col gap-1 mt-auto">
                    {dayUCs.slice(0, 3).map((uc) => {
                      const status = getStatusUC(uc.id, parseInt(uc.data_leitura, 10));
                      const clienteName =
                        uc.cliente?.nome ||
                        clientes.find((c) => c.id === uc.cliente_id)?.nome ||
                        "Cliente";

                      const colorClass = {
                        extraido: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                        pendente: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                        urgencia: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                      }[status];

                      return (
                        <div
                          key={uc.id}
                          className={`text-xs px-1 py-0.5 rounded truncate ${colorClass}`}
                          title={`${clienteName} - UC ${uc.numero_uc}`}
                        >
                          {clienteName.split(" ")[0]} · {uc.numero_uc}
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
        )}
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-900/30" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Extraída</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-100 dark:bg-yellow-900/30" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Pendente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/30" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Urgência (leitura vencida)</span>
        </div>
      </div>

      {selectedDay !== null && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Leituras do dia {selectedDay} de {meses[month]}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <div className="p-6 space-y-4">
                {getUCsForDay(selectedDay).map((uc) => {
                  const status = getStatusUC(uc.id, parseInt(uc.data_leitura, 10));
                  const cliente =
                    uc.cliente || clientes.find((c) => c.id === uc.cliente_id);

                  const statusConfig = {
                    extraido: {
                      bg: "bg-emerald-50 dark:bg-emerald-900/20",
                      border: "border-emerald-200 dark:border-emerald-900/50",
                      badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                      label: "EXTRAÍDA",
                    },
                    pendente: {
                      bg: "bg-yellow-50 dark:bg-yellow-900/20",
                      border: "border-yellow-200 dark:border-yellow-900/50",
                      badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                      label: "PENDENTE",
                    },
                    urgencia: {
                      bg: "bg-red-50 dark:bg-red-900/20",
                      border: "border-red-200 dark:border-red-900/50",
                      badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                      label: "URGÊNCIA",
                    },
                  }[status];

                  return (
                    <div
                      key={uc.id}
                      className={`rounded-lg p-4 border ${statusConfig.bg} ${statusConfig.border}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                UC {uc.numero_uc}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                                {cliente?.nome}
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.badge}`}
                            >
                              ● {statusConfig.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Distribuidora</p>
                              <p className="font-medium text-gray-900 dark:text-white">{uc.distribuidora}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Dia de Leitura</p>
                              <p className="font-medium text-gray-900 dark:text-white">Dia {uc.data_leitura}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Dia de Vencimento</p>
                              <p className="font-medium text-gray-900 dark:text-white">Dia {uc.data_vencimento || "—"}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Grupo Tarifário</p>
                              <p className="font-medium text-gray-900 dark:text-white">{uc.grupo_tarifario || "—"}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 text-white px-4 py-2 font-medium hover:bg-emerald-600 transition-colors whitespace-nowrap">
                            <AlertCircle className="h-4 w-4" />
                            Extrair
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

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
