import re
from helpers import to_float_br, formatar_saldo, limpar_texto

# FUNÇÕES EXTRATORAS
    # GRUPO A
def extrair_dados_GRUPO_A_2022_JUL2024(fatura: list[str]) -> list: # EM ANDAMENTO
    
    # REFERÊNCIAS
    unidade = 0 #OK
    mes_referencia = 0 #OK
    data_leitura = 0 #OK

    # FINANCEIROS
    subtotal_faturamento = 0 #OK
    subtotal_outros = 0 #OK
    icms = 0 #OK
    pis_pasep = 0 #OK
    cofins = 0 #OK 
    tipo_GD = "GD1" #OK
    cip = 0 #OK
    bandeira_amarela= 0 #OK
    bandeira_vermelha = 0 #OK
    
    # DEMANDA
    demanda_Ponta = 0 #OK
    tarifa_demanda_Ponta = 0 #OK
    demanda_FP = 0 #OK
    tarifa_demanda_FP = 0 #OK
    demanda_G = 0 #OK
    tarifa_demanda_G = 0 #OK
    demanda_G_ultrapassagem = 0 #OK
    tarifa_demanda_G_ultrapassagem = 0 #OK
    demanda_sem_ICMS = 0 #OK
    tarifa_demanda_sem_ICMS = 0 #OK
    demanda_ultrapassagem = 0 #OK
    tarifa_demanda_ultrapassagem = 0 #OK

    
    # TARIFAS
        # FORA PONTA
    tarifa_cons_TE_FP = 0 #OK
    tarifa_cons_TUSD_FP = 0 #OK
    tarifa_comp_TUSD_FP = 0 #OK
    tarifa_comp_TE_FP = 0 #OK
    tarifa_homologada_TE_FP = 0 #OK
    tarifa_homologada_TUSD_FP = 0 #OK
    tarifa_consumo_reativo_FP = 0 #OK

        # PONTA
    tarifa_cons_TE_Ponta = 0 #OK
    tarifa_cons_TUSD_Ponta = 0  #OK
    tarifa_comp_TE_Ponta = 0 #OK
    tarifa_comp_TUSD_Ponta = 0 #OK
    tarifa_homologada_TE_Ponta = 0 #OK
    tarifa_homologada_TUSD_Ponta = 0 #OK
    tarifa_consumo_reativo_Ponta = 0 #OK

    # FORA PONTA
    consumo_FP = 0 #OK
    consumo_reativo_FP = 0 #OK
    credito_utilizado_FP = 0 #OK
    credito_utilizado_real_FP = 0 #OK
    saldo_atualizado_FP = 0 #OK
    energia_injetada_FP = 0 #OK

    # PONTA
    consumo_Ponta = 0 #OK
    consumo_reativo_Ponta = 0 #OK
    credito_utilizado_Ponta = 0 #OK
    credito_utilizado_real_Ponta = 0 #OK
    saldo_atualizado_Ponta = 0 #OK
    energia_injetada_Ponta = 0 #OK
   
  
    num = 0 #variável de controle global

    dados = (
            unidade, mes_referencia, data_leitura, subtotal_faturamento, bandeira_vermelha, bandeira_amarela, demanda_G, tarifa_demanda_G, demanda_G_ultrapassagem, tarifa_demanda_G_ultrapassagem, demanda_sem_ICMS,tarifa_demanda_sem_ICMS, demanda_ultrapassagem, tarifa_demanda_ultrapassagem, tarifa_cons_TUSD_FP, tarifa_cons_TE_FP, tarifa_comp_TUSD_FP, tarifa_comp_TE_FP, consumo_FP, consumo_reativo_FP, tarifa_consumo_reativo_FP,credito_utilizado_FP, credito_utilizado_real_FP, saldo_atualizado_FP, energia_injetada_FP, demanda_FP, tarifa_demanda_FP, tarifa_cons_TUSD_Ponta, tarifa_cons_TE_Ponta, tarifa_comp_TUSD_Ponta, tarifa_comp_TE_Ponta,consumo_Ponta, consumo_reativo_Ponta, tarifa_consumo_reativo_Ponta, credito_utilizado_Ponta, credito_utilizado_real_Ponta, saldo_atualizado_Ponta, energia_injetada_Ponta, demanda_Ponta, tarifa_demanda_Ponta,
            icms, pis_pasep, cofins, tipo_GD, cip, subtotal_outros,
            tarifa_homologada_TUSD_Ponta,
            tarifa_homologada_TE_Ponta,
            tarifa_homologada_TUSD_FP,
            tarifa_homologada_TE_FP
        )
    
    return dados

def extrair_dados_GRUPO_A_AGO2024_HOJE(fatura: list[str]) -> list: # FINALIZADO
    
    # REFERÊNCIAS
    unidade = 0 #OK
    mes_referencia = 0 #OK
    data_leitura = 0 #OK

    # FINANCEIROS
    subtotal_faturamento = 0 #OK
    subtotal_outros = 0 #OK
    icms = 0 #OK
    pis_pasep = 0 #OK
    cofins = 0 #OK 
    tipo_GD = "GD1" #OK
    cip = 0 #OK
    bandeira_amarela= 0 #OK
    bandeira_vermelha = 0 #OK
    
    # DEMANDA
    demanda_Ponta = 0 #OK
    tarifa_demanda_Ponta = 0 #OK
    demanda_FP = 0 #OK
    tarifa_demanda_FP = 0 #OK
    demanda_G = 0 #OK
    tarifa_demanda_G = 0 #OK
    demanda_G_ultrapassagem = 0 #OK
    tarifa_demanda_G_ultrapassagem = 0 #OK
    demanda_sem_ICMS = 0 #OK
    tarifa_demanda_sem_ICMS = 0 #OK
    demanda_ultrapassagem = 0 #OK
    tarifa_demanda_ultrapassagem = 0 #OK

    
    # TARIFAS
        # FORA PONTA
    tarifa_cons_TE_FP = 0 #OK
    tarifa_cons_TUSD_FP = 0 #OK
    tarifa_comp_TUSD_FP = 0 #OK
    tarifa_comp_TE_FP = 0 #OK
    tarifa_homologada_TE_FP = 0 #OK
    tarifa_homologada_TUSD_FP = 0 #OK
    tarifa_consumo_reativo_FP = 0 #OK

        # PONTA
    tarifa_cons_TE_Ponta = 0 #OK
    tarifa_cons_TUSD_Ponta = 0  #OK
    tarifa_comp_TE_Ponta = 0 #OK
    tarifa_comp_TUSD_Ponta = 0 #OK
    tarifa_homologada_TE_Ponta = 0 #OK
    tarifa_homologada_TUSD_Ponta = 0 #OK
    tarifa_consumo_reativo_Ponta = 0 #OK

    # FORA PONTA
    consumo_FP = 0 #OK
    consumo_reativo_FP = 0 #OK
    credito_utilizado_FP = 0 #OK
    credito_utilizado_real_FP = 0 #OK
    saldo_atualizado_FP = 0 #OK
    energia_injetada_FP = 0 #OK

    # PONTA
    consumo_Ponta = 0 #OK
    consumo_reativo_Ponta = 0 #OK
    credito_utilizado_Ponta = 0 #OK
    credito_utilizado_real_Ponta = 0 #OK
    saldo_atualizado_Ponta = 0 #OK
    energia_injetada_Ponta = 0 #OK
   
  
    num = 0 #variável de controle global
    
    for texto in fatura:
        if "MONOFÁSICO" in texto or "TRIFÁSICO" in texto or "BIFÁSICO" in texto:
            data_leitura = fatura[num+2]
            mes_referencia = data_leitura[-8:]
        
        if "Se você ainda não tem débito automático, cadastra-se na sua instituição bancária utilizando o código " in texto:
            unidade = texto.replace("Se você ainda não tem débito automático, cadastra-se na sua instituição bancária utilizando o código ","") #Número da UC

        if "CIP ILUM PUB PREF MUNICIPAL" in texto:
            cip = float(fatura[num+1].replace(".","").replace(",",".")) #cip

        if "PIS/PASEP" in texto:
            pis_pasep = float(fatura[num+2].replace(".","").replace(",",".")) #pis

        if "COFINS" in texto:  
            cofins = float(fatura[num+2].replace(".","").replace(",",".")) #cofins

        if "ICMS" in texto:    
            icms = float(fatura[num+2].replace(".","").replace(",",".")) #icms

    
        if "GD2" in texto and tipo_GD == "GD1":
            tipo_GD = "GD2"
        
        if "GD3" in texto and tipo_GD == "GD1":
            tipo_GD = "GD3"

        if "Subtotal Faturamento" in texto:
            subtotal_faturamento = fatura[num+1].replace(".","").replace("\n","")

        if "Subtotal Outros" in texto:
            subtotal_outros = fatura[num+1].replace(".","").replace("\n","")    
          
        # CONSUMOS E TARIFAS
                     
        if "Energia Atv Forn F Ponta TE" in texto:
            tarifa_cons_TE_FP = fatura[num+3].replace("\n","")
            consumo_FP = fatura[num+2].replace(".","").replace("\n","")
            tarifa_homologada_TE_FP = fatura[num+9].replace("\n","").replace("-","")


        if "Energia Atv Forn F Ponta TUSD" in texto:
            tarifa_cons_TUSD_FP = fatura[num+3].replace("\n","")
            tarifa_homologada_TUSD_FP = fatura[num+9].replace("\n","").replace("-","")


            
        if "Energia Atv Forn Ponta TE" in texto:
            tarifa_cons_TE_Ponta = fatura[num+3].replace("\n","")
            consumo_Ponta = fatura[num+2].replace(".","").replace("\n","")
            tarifa_homologada_TE_Ponta = fatura[num+9].replace("\n","").replace("-","")

            
        if "Energia Atv Forn Ponta TUSD" in texto:
            tarifa_cons_TUSD_Ponta = fatura[num+3].replace("\n","")
            tarifa_homologada_TUSD_Ponta = fatura[num+9].replace("\n","").replace("-","")

                    
        if "Consumo Reativo Excedente Fp" in texto:
            tarifa_consumo_reativo_FP = fatura[num+3].replace("\n","")
            consumo_reativo_FP = (fatura[num+2].replace(".","").replace("\n",""))


        if "Consumo Reativo Excedente Np" in texto:
            tarifa_consumo_reativo_Ponta = fatura[num+3].replace("\n","")
            consumo_reativo_Ponta = (fatura[num+2].replace(".","").replace("\n",""))

                               
        if "Adicional Band. Vermelha" in texto:
            bandeira_vermelha = fatura[num+3].replace("\n","")

                  
        if "Adicional Band. Amarela" in texto:
            bandeira_amarela = fatura[num+3].replace("\n","")
          
          # COMPENSAÇÃO E TARIFAS 
          
        if "Energ Atv Inj FP TE" in texto:
            tarifa_comp_TE_FP = fatura[num+3].replace("\n","").replace("-","")
            credito_utilizado_real_FP = credito_utilizado_real_FP + float(limpar_texto(fatura[num+2]).replace(".",""))
            

            
        if "Energ Atv Inj FP TUSD" in texto:
            tarifa_comp_TUSD_FP = fatura[num+3].replace("\n","").replace("-","")
            
        if "Energ Atv Inj Ponta TE" in texto:
            tarifa_comp_TE_Ponta = fatura[num+3].replace("\n","").replace("-","")
            credito_utilizado_real_Ponta = credito_utilizado_real_Ponta + int(limpar_texto(fatura[num+2]).replace(".",""))


        if "Energ Atv Inj Ponta TUSD" in texto:
            tarifa_comp_TUSD_Ponta = fatura[num+3].replace("\n","").replace("-","")
              
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
            demanda_FP = fatura[num+2].replace("\n","")
            tarifa_demanda_FP = fatura[num+3].replace("\n","")
            
        if "Demanda Ativa sem ICMS" in texto:
            demanda_sem_ICMS = fatura[num+2].replace("\n","")
            tarifa_demanda_sem_ICMS = fatura[num+3].replace("\n","")
        
        if "Demanda Ultrapassagem" in texto and tarifa_demanda_ultrapassagem == 0:
            demanda_ultrapassagem = fatura[num+2].replace("\n","")
            tarifa_demanda_ultrapassagem = fatura[num+3].replace("\n","")
        
        
        if "Demanda De Geração" in texto:
            demanda_G = fatura[num+2].replace("\n","")
            tarifa_demanda_G = fatura[num+3].replace("\n","")   
                
        if "Demanda Ultrapassagem Geração" in texto:
            demanda_G_ultrapassagem = fatura[num+2].replace("\n","")
            tarifa_demanda_G_ultrapassagem = fatura[num+3].replace("\n","")
        
        num += 1
               
        # INSERIR AS INFORMAÇÕES DA FATURA NA ABA "INPUT" DA PLANILHA      
        # Dados a serem inseridos
                
        dados = (
            unidade, mes_referencia, data_leitura, subtotal_faturamento, bandeira_vermelha, bandeira_amarela, demanda_G, tarifa_demanda_G, demanda_G_ultrapassagem, tarifa_demanda_G_ultrapassagem, demanda_sem_ICMS,tarifa_demanda_sem_ICMS, demanda_ultrapassagem, tarifa_demanda_ultrapassagem, tarifa_cons_TUSD_FP, tarifa_cons_TE_FP, tarifa_comp_TUSD_FP, tarifa_comp_TE_FP, consumo_FP, consumo_reativo_FP, tarifa_consumo_reativo_FP,credito_utilizado_FP, credito_utilizado_real_FP, saldo_atualizado_FP, energia_injetada_FP, demanda_FP, tarifa_demanda_FP, tarifa_cons_TUSD_Ponta, tarifa_cons_TE_Ponta, tarifa_comp_TUSD_Ponta, tarifa_comp_TE_Ponta,consumo_Ponta, consumo_reativo_Ponta, tarifa_consumo_reativo_Ponta, credito_utilizado_Ponta, credito_utilizado_real_Ponta, saldo_atualizado_Ponta, energia_injetada_Ponta, demanda_Ponta, tarifa_demanda_Ponta,
            icms, pis_pasep, cofins, tipo_GD, cip, subtotal_outros,
            tarifa_homologada_TUSD_Ponta,
            tarifa_homologada_TE_Ponta,
            tarifa_homologada_TUSD_FP,
            tarifa_homologada_TE_FP
        )
        
    return dados
