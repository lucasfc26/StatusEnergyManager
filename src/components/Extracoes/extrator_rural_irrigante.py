# PERCORRE A LISTA CRIADA E COLETA AS INFORMAÇÕES DA FATURA
# ABRE O ARQUIVO DE TEXTO DA FATURA
def to_float_br(s: str) -> float:
    s = s.strip()
    if s.endswith('-'):
        s = '-' + s[:-1].strip()   # move o "-" do fim para o começo
    return s.replace('.', '').replace(',', '.')

def formatar_saldo(saldo):
  # Remove os pontos que não são separadores decimais
  saldo_formatado = saldo.replace('.', '').replace(',', '.')
  # Converte de volta para string e substitui o ponto final por vírgula
  saldo_formatado = saldo_formatado.replace('.', '', saldo_formatado.count('.') - 1).replace('.', ',')
  return saldo_formatado.replace(" kWh","")

def limpar_texto(var):

  return var.replace(f"\n","").replace("-", "").replace(",",".")


user_home = os.path.expanduser("~")

base_dir = os.path.join(
    user_home,
    "OneDrive - Status Energy",
    "DRIVE STATUS",
    "CLIENTES",
    "02.Execução",
    "SÉRGIO JEREISSATI (SOL NASCENTE CARNICULTURA)",
    "2. Análise e Relatório",
)

meses = [
    "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
    "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
]

anos = [2023, 2024, 2025, 2026]

def extrair_dados_GRUPO_A_AGO2024_HOJE(fatura: list[str]) -> list:
          
    # INDEPENDENTES
    unidade = 0 # OK
    mes_referencia = 0 # OK
    data_leitura = 0 # OK
    subtotal_faturamento = 0 # OK
    subtotal_outros = 0 # OK
    bandeira_vermelha = 0 # OK
    bandeira_amarela= 0 # OK
    demanda_G = 0 # OK
    tarifa_demanda_G = 0 # OK
    demanda_G_ultrapassagem = 0 # OK
    tarifa_demanda_G_ultrapassagem = 0 # OK
    demanda_sem_ICMS = 0 # OK
    tarifa_demanda_sem_ICMS = 0 # OK
    demanda_ultrapassagem = 0# OK
    tarifa_demanda_ultrapassagem = 0 # OK
    demanda_reativa=0 # OK
    tarifa_demanda_reativa=0 # OK
    demanda_complementar=0 # OK
    tarifa_demanda_complementar=0 # OK
    icms=0 # OK
    pis_pasep=0 # OK
    cofins=0 # OK
    cip = 0 # OK
    beneficio_bruto = 0
    beneficio_liquido = 0

    # FORA PONTA
    tarifa_homo_TE_FP=0 # OK
    tarifa_homo_TUSD_FP=0 # OK
    tarifa_cons_TUSD_FP = 0  # OK
    tarifa_cons_TE_FP = 0  # OK
    tarifa_comp_TUSD_FP = 0  # OK
    tarifa_comp_TE_FP = 0 # OK
    tarifa_consumo_reativo_FP = 0 # OK
    
    consumo_FP = 0 # OK
    consumo_reativo_FP = 0 # OK
    credito_utilizado_FP = 0 # OK
    credito_utilizado_real_FP = 0 # OK
    saldo_atualizado_FP = 0 # OK
    energia_injetada_FP = 0 # OK
    demanda_FP = 0 # OK
    tarifa_demanda_FP = 0 # OK
    
    
    # RESERVADO
    tarifa_cons_TUSD_Reservado = 0  # OK
    tarifa_cons_TE_Reservado = 0  # OK
    tarifa_comp_TUSD_Reservado = 0 # OK
    tarifa_comp_TE_Reservado = 0 # OK
    tarifa_homo_TE_Reservado = 0 # OK
    tarifa_homo_TUSD_Reservado = 0 # OK
    consumo_Reservado = 0 # OK
    consumo_reativo_Reservado = 0 # OK 
    tarifa_consumo_reativo_Reservado = 0  # OK
    credito_utilizado_Reservado = 0 # OK
    credito_utilizado_real_Reservado = 0 # OK
    saldo_atualizado_Reservado = 0 # OK
    energia_injetada_Reservado = 0 # OK


    # PONTA
    tarifa_cons_TUSD_Ponta = 0  
    tarifa_cons_TE_Ponta = 0 
    tarifa_comp_TUSD_Ponta = 0 
    tarifa_comp_TE_Ponta = 0 
    tarifa_homo_TE_Ponta = 0
    tarifa_homo_TUSD_Ponta = 0
    consumo_Ponta = 0 
    consumo_reativo_Ponta = 0 
    tarifa_consumo_reativo_Ponta = 0 
    credito_utilizado_Ponta = 0 
    credito_utilizado_real_Ponta = 0 
    saldo_atualizado_Ponta = 0 
    energia_injetada_Ponta = 0 
    demanda_Ponta = 0
    tarifa_demanda_Ponta = 0
    

    num = 0 #variável de controle
    
    if novo_arquivo.lower().endswith(".txt"):  # Verifica se o arquivo é um arquivo de texto
    
    try:

        caminho_arquivo = os.path.join(diretorio, novo_arquivo)
        fatura = open(caminho_arquivo, "r", encoding="utf-8").readlines() #Transforma a fatura numa variável tipo lista.
        
        # Carregar o arquivo Excel existente  
        arquivo_excel = r"C:\Users\kaioq\OneDrive - Status Energy\DRIVE STATUS\CLIENTES\02.Execução\SÉRGIO JEREISSATI (SOL NASCENTE CARNICULTURA)\2. Análise e Relatório\INPUT FATURAS.xlsx"
        planilha_nome = "INPUT"
        wb = load_workbook(filename=arquivo_excel)
        planilha = wb[planilha_nome]
        
        # Preencheer uma lista de controle para evitar duplicatas
        controle_uc = [] # Controle número da UC
        controle_mes = [] # Controle mês de referência
        controle_unif = [] # Controle unificado Ex:. 138801 04/2024 
        
        for celula in planilha ['A']:
        controle_uc.append(celula.value)
        
        for celula in planilha ['B']:
        controle_mes.append(celula.value)
        
        for mes, uc in zip(controle_mes, controle_uc):
        controle_unif.append(f"{mes} {uc}")

        for texto in fatura:
        
        if "TRIFÁSICO" in texto:
            linha = fatura[num + 2]
            data_leitura = linha[-11:]
            mes_referencia = linha[-8:]

        if "Se você ainda não tem débito automático, cadastra-se na sua instituição bancária utilizando o código " in texto:
            unidade = texto.replace("Se você ainda não tem débito automático, cadastra-se na sua instituição bancária utilizando o código ","") #Número da UC
        num = num + 1     
        
        if f"{mes_referencia} {unidade}" not in controle_unif:
        num = 0 #variável de controle          
        
        for texto in fatura:

            if "Subtotal Faturamento" in texto:
            subtotal_faturamento = fatura[num+1].replace(".","").strip()
            subtotal_outros = to_float_br(fatura[num+1].replace(".","").strip())

            if "Benefício Tarifário Bruto" in texto:
            beneficio_bruto = to_float_br(fatura[num+1])
            
            if "Benefício Tarifário Líquido" in texto:
            beneficio_liquido = to_float_br(fatura[num+1])
            
            # CONSUMOS E TARIFAS
                    
            if "Energia Atv Forn F Ponta TE" in texto:
            tarifa_cons_TE_FP = fatura[num+3].strip()
            consumo_FP = fatura[num+2].replace(".","").strip()
            tarifa_homo_TE_FP = fatura[num+9].replace(".","").strip()

            if "Energia Atv Forn F Ponta TUSD" in texto:
            tarifa_cons_TUSD_FP = fatura[num+3].strip()
            tarifa_homo_TUSD_FP = fatura[num+9].replace(".","").strip()

            if "Energia Atv Forn Ponta TE" in texto:
            tarifa_cons_TE_Ponta = fatura[num+3].strip()
            consumo_Ponta = fatura[num+2].replace(".","").strip()
            tarifa_homo_TE_Ponta = fatura[num+9].replace(".","").strip()
            
            if "Energia Atv Forn Ponta TUSD" in texto:
            tarifa_cons_TUSD_Ponta = fatura[num+3].strip()         
            tarifa_homo_TUSD_Ponta = fatura[num+9].replace(".","").strip()

            if "Energia Atv Forn Reserv TE" in texto:
            tarifa_cons_TE_Reservado = fatura[num+3].strip()
            consumo_Reservado = fatura[num+2].replace(".","").strip()
            tarifa_homo_TE_Reservado = fatura[num+9].replace(".","").strip()

            if "Energia Atv Forn Reserv TUSD" in texto:
            tarifa_cons_TUSD_Reservado = fatura[num+3].strip()   
            tarifa_homo_TUSD_Reservado = fatura[num+9].replace(".","").strip()

            if "Consumo Reativo Excedente Fp" in texto:
            tarifa_consumo_reativo_FP = fatura[num+3].strip()
            consumo_reativo_FP = (fatura[num+2].replace(".","").strip())

            if "Consumo Reativo Excedente Np" in texto:
            tarifa_consumo_reativo_Ponta = fatura[num+3].strip()
            consumo_reativo_Ponta = (fatura[num+2].replace(".","").strip())

            if "Consumo Reativo Excedente Rv" in texto:
            tarifa_consumo_reativo_Reservado = fatura[num+3].strip()
            consumo_reativo_Reservado = (fatura[num+2].replace(".","").strip())
            
            if "Adicional Band. Vermelha" in texto:
            bandeira_vermelha = fatura[num+3].strip()
            
            if "Adicional Band. Amarela" in texto:
            bandeira_amarela = fatura[num+3].strip()


            # COMPENSAÇÃO E TARIFAS 
            
            if "Energ Atv Inj FP TE" in texto:
            tarifa_comp_TE_FP = fatura[num+3].strip().replace("-","")
            credito_utilizado_real_FP = credito_utilizado_real_FP + float(limpar_texto(fatura[num+2]).replace(".",""))
            
            if "Energ Atv Inj FP TUSD" in texto:
            tarifa_comp_TUSD_FP = fatura[num+3].strip().replace("-","")
            
            if "Energ Atv Inj Ponta TE" in texto:
            tarifa_comp_TE_Ponta = fatura[num+3].strip().replace("-","")
            credito_utilizado_real_Ponta = credito_utilizado_real_Ponta + int(limpar_texto(fatura[num+2]).replace(".",""))

            if "Energ Atv Inj Ponta TUSD" in texto:
            tarifa_comp_TUSD_Ponta = fatura[num+3].strip().replace("-","")

            if "Energ Atv Inj Reser TE" in texto:
            tarifa_comp_TE_Reservado = fatura[num+3].strip().replace("-","")
            credito_utilizado_real_Reservado = credito_utilizado_real_Reservado + int(limpar_texto(fatura[num+2]).replace(".",""))

            if "Energ Atv Inj Reser TUSD" in texto:
            tarifa_comp_TUSD_Reservado = fatura[num+3].strip().replace("-","")
                
            # RESERVADO

            # SALDO ACUMULADO, UTILIZADO E INJETADO

            if "Data de apresentação:" in texto:
                texto_inteiro = [fatura[num+1], fatura[num+2], fatura[num+3], fatura[num+4]]
                mensagens_importantes = " ".join(texto_inteiro).replace("\n", "")

                def extract_value(pattern, text):
                    match = re.search(pattern, text)
                    return match.group(1).replace(".", "") if match else 0

                # FORA PONTA
                energia_injetada_FP = extract_value(r'Energia Injetada HFP no mês: ([\d,.]+)', mensagens_importantes)
                credito_utilizado_FP = extract_value(r'HFP.*?Saldo utilizado no mês: ([\d,.]+)', mensagens_importantes)
                saldo_atualizado_FP = extract_value(r'HFP.*?Saldo atualizado: ([\d,.]+)', mensagens_importantes)

                # PONTA
                energia_injetada_Ponta = extract_value(r'Energia Injetada HP no mês: ([\d,.]+)', mensagens_importantes)
                credito_utilizado_Ponta = extract_value(r'HP.*?Saldo utilizado no mês: ([\d,.]+)', mensagens_importantes)
                saldo_atualizado_Ponta = extract_value(r'HP.*?Saldo atualizado: ([\d,.]+)', mensagens_importantes)
            
                
                    
            #DEMANDAS
            
            if "Demanda Ativa" in texto and tarifa_demanda_FP == 0:
            demanda_FP = fatura[num+2].strip()
            tarifa_demanda_FP = fatura[num+3].strip()
            
            if "Demanda Ativa sem ICMS" in texto:
            demanda_sem_ICMS = fatura[num+2].strip()
            tarifa_demanda_sem_ICMS = fatura[num+3].strip()
            
            if "Demanda Ultrapassagem" in texto and tarifa_demanda_ultrapassagem == 0:
            demanda_ultrapassagem = fatura[num+2].strip()
            tarifa_demanda_ultrapassagem = fatura[num+3].strip()
            
            if "Demanda De Geração" in texto:
            demanda_G = fatura[num+2].strip()
            tarifa_demanda_G = fatura[num+3].strip()   
                    
            if "Demanda Ultrapassagem Geração" in texto:
            demanda_G_ultrapassagem = fatura[num+2].strip()
            tarifa_demanda_G_ultrapassagem = fatura[num+3].strip()

            if "Demanda Complementar" in texto:
            demanda_complementar = fatura[num+2].strip()
            tarifa_demanda_complementar = fatura[num+3].strip()

            if "Demanda Reativa" in texto and demanda_reativa == 0 and "Demanda Reativa-kVAr" not in texto:
            demanda_reativa = fatura[num+2].strip()
            tarifa_demanda_reativa = fatura[num+3].strip()

            # IMPOSTOS

            if "PIS/PASEP" in texto:
            pis_pasep = fatura[num+2].strip()

            if "COFINS" in texto:
            cofins = fatura[num+2].strip()

            if "ICMS" in texto:
            icms = fatura[num+8].strip()
            
        
            num = num + 1
                
        # INSERIR AS INFORMAÇÕES DA FATURA NA ABA "INPUT" DA PLANILHA      
        # Dados a serem inseridos
        
        
        dados = [unidade, mes_referencia, data_leitura, subtotal_faturamento, bandeira_vermelha, bandeira_amarela, demanda_G, tarifa_demanda_G, demanda_G_ultrapassagem, tarifa_demanda_G_ultrapassagem, demanda_sem_ICMS, tarifa_demanda_sem_ICMS, demanda_ultrapassagem, tarifa_demanda_ultrapassagem, tarifa_cons_TUSD_FP, tarifa_cons_TE_FP, tarifa_comp_TUSD_FP, tarifa_comp_TE_FP, consumo_FP, consumo_reativo_FP, tarifa_consumo_reativo_FP,credito_utilizado_FP, credito_utilizado_real_FP, saldo_atualizado_FP, energia_injetada_FP, demanda_FP, tarifa_demanda_FP, tarifa_cons_TUSD_Ponta, tarifa_cons_TE_Ponta, tarifa_comp_TUSD_Ponta, tarifa_comp_TE_Ponta,consumo_Ponta, consumo_reativo_Ponta, tarifa_consumo_reativo_Ponta, credito_utilizado_Ponta, credito_utilizado_real_Ponta, saldo_atualizado_Ponta, energia_injetada_Ponta, demanda_Ponta, tarifa_demanda_Ponta, icms, pis_pasep, cofins, demanda_reativa, tarifa_demanda_reativa, tarifa_cons_TUSD_Reservado, tarifa_cons_TE_Reservado, tarifa_comp_TUSD_Reservado, tarifa_comp_TE_Reservado, tarifa_homo_TE_Reservado,tarifa_homo_TUSD_Reservado,consumo_Reservado, consumo_reativo_Reservado, tarifa_consumo_reativo_Reservado, credito_utilizado_Reservado, credito_utilizado_real_Reservado, saldo_atualizado_Reservado, energia_injetada_Reservado, tarifa_homo_TE_FP, tarifa_homo_TE_Ponta, tarifa_homo_TUSD_FP, tarifa_homo_TUSD_Ponta, subtotal_outros,demanda_complementar,tarifa_demanda_complementar, beneficio_bruto, beneficio_liquido]
    
        
        # Inserir os valores nas células correspondentes, começando a partir da próxima linha vazia
        
        planilha.append(dados)          
        wb.save(arquivo_excel)
        os.remove(caminho_arquivo)

        else:
        print(f"{novo_arquivo} já consta na lista de INPUTS")
        os.remove(caminho_arquivo)   
    except Exception as e:
        print(f"Erro ao abrir o arquivo {novo_arquivo}: {e}")
