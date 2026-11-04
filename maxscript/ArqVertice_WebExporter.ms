/*
================================================================================
  ARQVÉRTICE - WEB 3D EXPORTER (3ds Max + Corona Renderer -> WebGL / Next.js)
  Arquivo: ArqVertice_WebExporter.ms
  Categoria MacroScript: "ArqVertice Tools"
  Compatibilidade: 3ds Max 2021 - 2026 | Corona Renderer 7, 8, 9, 10, 11, 12
================================================================================
*/

macroScript ArqVerticeWebExporter
  category:"ArqVertice Tools"
  tooltip:"Exportador Web 3D (ArqVértice)"
  buttonText:"ArqVértice GLB"
  icon:#("Standard", 1)
(
  -- Fecha instância anterior da janela caso esteja aberta
  try(if ::ro_ArqVerticeWebExporter != undefined do destroyDialog ::ro_ArqVerticeWebExporter) catch()

  rollout ro_ArqVerticeWebExporter "ArqVértice - Web 3D Exporter" width:410 height:520
  (
    ----------------------------------------------------------------------------
    -- INTERFACE GRÁFICA (ROLLOUT)
    ----------------------------------------------------------------------------
    groupBox grpHeader "Projeto WebGL (Next.js / Three.js)" pos:[12, 10] width:386 height:96
    label lblPath "Pasta de destino (/public/models/):" pos:[24, 30] align:#left
    editText edtExportPath "" pos:[20, 48] width:300 height:22 text:@"C:\Users\eduar\OneDrive\Documentos\Arqvertic Project 3D\public\models"
    button btnBrowse "Pasta..." pos:[326, 47] width:60 height:24 tooltip:"Selecionar a pasta /public/models/ do projeto Next.js"

    radiobuttons rdoScope "Escopo:" labels:#("Cena Completa", "Apenas Seleção") default:1 pos:[24, 78] columns:2

    groupBox grpPipeline "Pipeline de Preparação 3ds Max -> WebGL" pos:[12, 114] width:386 height:282

    button btnStep1 "1. Padronizar Nomenclatura de Luminárias (LIGHT_)" pos:[24, 138] width:362 height:38 \
      tooltip:"Adiciona o prefixo LIGHT_ aos objetos selecionados ou com material emissivo/CoronaLightMtl"

    button btnStep2 "2. Preparar e Converter Materiais Corona para PBR" pos:[24, 186] width:362 height:38 \
      tooltip:"Converte CoronaPhysicalMtl / CoronaLegacyMtl / CoronaMtl para Physical Material nativo (glTF PBR)"

    button btnStep3 "3. Limpar Cena e Resetar Transformações (Reset XForm)" pos:[24, 234] width:362 height:38 \
      tooltip:"Remove helpers/dummies/objetos ocultos, aplica Reset XForm e colapsa a pilha para Editable Poly"

    checkbox chkRemoveHidden "Remover objetos ocultos na limpeza" pos:[26, 282] checked:true
    checkbox chkRunNodeOptimizer "Disparar 'npm run optimize:3d' (Draco) ao exportar" pos:[26, 304] checked:true

    label lblTargetFile "Arquivo de saída:" pos:[26, 332] align:#left
    dropdownlist ddlFileName "" items:#("residencia-raw.glb (Para otimizador Node.js)", "residencia.glb (Direto para produção)") selection:1 pos:[120, 328] width:266

    button btnStep4 "4. Exportar GLB Otimizado para Web" pos:[24, 354] width:362 height:34 \
      tooltip:"Exporta o modelo .glb com coordenadas UVW e texturas PBR embutidas"

    groupBox grpStatus "Log de Execução" pos:[12, 404] width:386 height:104
    progressBar pbProgress "" pos:[24, 424] width:362 height:12 value:0 color:(color 212 175 55)
    label lblStatus "Pronto. Siga as etapas de 1 a 4 para exportar." pos:[24, 444] width:362 height:54

    ----------------------------------------------------------------------------
    -- FUNÇÕES AUXILIARES DE MATERIAIS E TEXTURAS
    ----------------------------------------------------------------------------

    -- Extrai o BitmapTexture real caso esteja encapsulado dentro de CoronaNormal, CoronaBitmap ou ColorCorrection
    fn extractBitmapTex tex =
    (
      if tex == undefined do return undefined
      local cls = classOf tex

      if cls == Bitmaptexture do return tex

      -- Caso seja CoronaNormal, extrai o mapa normalMap interno
      if (isProperty tex #normalMap) and (tex.normalMap != undefined) do
        return (extractBitmapTex tex.normalMap)

      if (isProperty tex #texmap) and (tex.texmap != undefined) do
        return (extractBitmapTex tex.texmap)

      -- Caso seja CoronaBitmap, converte para Bitmaptexture padrão do 3ds Max para compatibilidade glTF
      if (cls as string) == "CoronaBitmap" and (isProperty tex #filename) and (tex.filename != undefined) do
      (
        local stdBmp = Bitmaptexture filename:tex.filename
        stdBmp.name = tex.name + "_PBR"
        return stdBmp
      )

      return tex
    )

    -- Verifica se um material (ou sub-material) possui emissão ou é CoronaLightMtl
    fn isEmissiveMaterial mat =
    (
      if mat == undefined do return false
      local clsName = (classOf mat) as string

      if clsName == "CoronaLightMtl" do return true

      if (isProperty mat #selfIllumLevel) and (mat.selfIllumLevel > 0.01) do return true
      if (isProperty mat #emission) and (mat.emission > 0.01) do return true
      if (isProperty mat #selfIllum) and (mat.selfIllum > 0.01) do return true

      if clsName == "Multimaterial" do
      (
        for subMat in mat.materialList where subMat != undefined do
        (
          if (isEmissiveMaterial subMat) do return true
        )
      )

      return false
    )

    -- Converte um único material Corona (CoronaPhysicalMtl, CoronaLegacyMtl, CoronaMtl, CoronaLightMtl) para PhysicalMaterial
    fn convertSingleMaterialToPBR mat =
    (
      if mat == undefined do return undefined
      local clsName = (classOf mat) as string

      -- Se já for PhysicalMaterial, apenas garante que está configurado
      if clsName == "PhysicalMaterial" do return mat

      -- Se for Multimaterial, converte recursivamente cada sub-material
      if clsName == "Multimaterial" do
      (
        for i = 1 to mat.numsubs do
        (
          if mat.materialList[i] != undefined do
            mat.materialList[i] = convertSingleMaterialToPBR mat.materialList[i]
        )
        return mat
      )

      -- 1. Conversão de CoronaLightMtl -> PhysicalMaterial Emissivo
      if clsName == "CoronaLightMtl" do
      (
        local pbrLight = PhysicalMaterial name:(mat.name + "_PBR_Light")
        pbrLight.base_color = color 255 245 220
        pbrLight.roughness = 0.2
        pbrLight.emission = 1.0

        if (isProperty mat #color) do pbrLight.emit_color = mat.color
        if (isProperty mat #intensity) do pbrLight.emit_luminance = amax #(mat.intensity * 1500.0, 1500.0)
        if (isProperty mat #texmap) and (mat.texmap != undefined) do
        (
          local lightTex = extractBitmapTex mat.texmap
          pbrLight.emit_color_map = lightTex
          pbrLight.base_color_map = lightTex
        )
        return pbrLight
      )

      -- 2. Conversão de CoronaPhysicalMtl -> PhysicalMaterial
      if clsName == "CoronaPhysicalMtl" do
      (
        local pbr = PhysicalMaterial name:(mat.name + "_PBR")
        pbr.roughness_inv = false -- Usa modo Roughness padrão glTF

        -- Base Color
        if (isProperty mat #baseColor) do pbr.base_color = mat.baseColor
        if (isProperty mat #baseTexmap) and (mat.baseTexmap != undefined) do
          pbr.base_color_map = extractBitmapTex mat.baseTexmap

        -- Roughness
        if (isProperty mat #baseRoughness) do pbr.roughness = mat.baseRoughness
        if (isProperty mat #baseRoughnessTexmap) and (mat.baseRoughnessTexmap != undefined) do
          pbr.roughness_map = extractBitmapTex mat.baseRoughnessTexmap

        -- Metalness
        if (isProperty mat #metalnessMode) do
          pbr.metalness = (if mat.metalnessMode == 1 or mat.metalnessMode == true then 1.0 else 0.0)
        if (isProperty mat #metalnessTexmap) and (mat.metalnessTexmap != undefined) do
          pbr.metalness_map = extractBitmapTex mat.metalnessTexmap

        -- Normal / Bump Map
        if (isProperty mat #baseBumpTexmap) and (mat.baseBumpTexmap != undefined) do
        (
          local extractedNorm = extractBitmapTex mat.baseBumpTexmap
          local normBump = Normal_Bump name:(mat.name + "_Normal")
          normBump.normal_map = extractedNorm
          pbr.bump_map = normBump
        )

        -- Refração / Vidro Físico
        if (isProperty mat #refractAmount) and (mat.refractAmount > 0.1) do
        (
          pbr.transparency = mat.refractAmount
          if (isProperty mat #ior) do pbr.trans_ior = mat.ior
        )

        -- Self-Illumination / Emissive
        if (isProperty mat #selfIllumLevel) and (mat.selfIllumLevel > 0.0) do
        (
          pbr.emission = mat.selfIllumLevel
          if (isProperty mat #selfIllumColor) do pbr.emit_color = mat.selfIllumColor
          if (isProperty mat #selfIllumTexmap) and (mat.selfIllumTexmap != undefined) do
            pbr.emit_color_map = extractBitmapTex mat.selfIllumTexmap
        )

        return pbr
      )

      -- 3. Conversão de CoronaLegacyMtl / CoronaMtl -> PhysicalMaterial
      if clsName == "CoronaLegacyMtl" or clsName == "CoronaMtl" do
      (
        local pbr = PhysicalMaterial name:(mat.name + "_PBR")
        pbr.roughness_inv = false

        -- Base Color
        if (isProperty mat #colorDiffuse) do pbr.base_color = mat.colorDiffuse
        if (isProperty mat #texmapDiffuse) and (mat.texmapDiffuse != undefined) do
          pbr.base_color_map = extractBitmapTex mat.texmapDiffuse

        -- Glossiness -> Roughness (invertido: Roughness = 1.0 - Glossiness)
        if (isProperty mat #reflectGlossiness) do
          pbr.roughness = clamp (1.0 - mat.reflectGlossiness) 0.02 1.0
        if (isProperty mat #texmapReflectGlossiness) and (mat.texmapReflectGlossiness != undefined) do
        (
          pbr.roughness_map = extractBitmapTex mat.texmapReflectGlossiness
          pbr.roughness_inv = true -- Mantém inversão caso haja mapa de Glossiness
        )

        -- Metalness (aproximação por Fresnel IOR alto no CoronaMtl antigo)
        if (isProperty mat #fresnelIor) and (mat.fresnelIor >= 8.0) do
          pbr.metalness = 0.95

        -- Normal / Bump
        if (isProperty mat #texmapBump) and (mat.texmapBump != undefined) do
        (
          local extractedNorm = extractBitmapTex mat.texmapBump
          local normBump = Normal_Bump name:(mat.name + "_Normal")
          normBump.normal_map = extractedNorm
          pbr.bump_map = normBump
        )

        -- Vidro / Transparência
        if (isProperty mat #levelRefract) and (mat.levelRefract > 0.1) do
        (
          pbr.transparency = mat.levelRefract
          if (isProperty mat #ior) do pbr.trans_ior = mat.ior
        )

        -- Emissive / Self-Illumination
        if (isProperty mat #levelSelfIllum) and (mat.levelSelfIllum > 0.0) do
        (
          pbr.emission = mat.levelSelfIllum
          if (isProperty mat #colorSelfIllum) do pbr.emit_color = mat.colorSelfIllum
          if (isProperty mat #texmapSelfIllum) and (mat.texmapSelfIllum != undefined) do
            pbr.emit_color_map = extractBitmapTex mat.texmapSelfIllum
        )

        return pbr
      )

      return mat
    )

    -- Retorna a lista de objetos alvo conforme o seletor de escopo (Cena Completa vs Seleção)
    fn getTargetNodes =
    (
      if rdoScope.state == 2 and selection.count > 0 then
        return (selection as array)
      else
        return (objects as array)
    )

    ----------------------------------------------------------------------------
    -- EVENTOS DOS BOTÕES DO ROLLOUT
    ----------------------------------------------------------------------------

    -- Selecionar Pasta de Destino (/public/models/)
    on btnBrowse pressed do
    (
      local chosenDir = getSavePath caption:"Selecione a pasta /public/models/ do projeto Next.js" initialDir:edtExportPath.text
      if chosenDir != undefined do edtExportPath.text = chosenDir
    )

    -- BOTÃO 1: Padronizar Nomenclatura de Luminárias (LIGHT_)
    on btnStep1 pressed do
    (
      undo "ArqVertice - Padronizar Luminárias" on
      (
        local renamedCount = 0
        local targetObjs = if selection.count > 0 then (selection as array) else (geometry as array)
        local total = amax #(targetObjs.count, 1)

        for i = 1 to targetObjs.count do
        (
          local obj = targetObjs[i]
          pbProgress.value = (i * 100.0 / total) as integer

          local isSelectedManual = (selection.count > 0)
          local hasLightMat = isEmissiveMaterial obj.material

          if isSelectedManual or hasLightMat do
          (
            local upperName = toUpper obj.name
            if not (matchPattern upperName pattern:"LIGHT_*") and not (matchPattern upperName pattern:"EMISSIVE_*") do
            (
              obj.name = "LIGHT_" + obj.name
              renamedCount += 1
            )
          )
        )

        pbProgress.value = 100
        lblStatus.text = ("Etapa 1 concluída: " + (renamedCount as string) + " luminária(s)/malha(s) emissiva(s) renomeada(s) com o prefixo 'LIGHT_'.")
      )
    )

    -- BOTÃO 2: Preparar e Converter Materiais Corona para PBR
    on btnStep2 pressed do
    (
      undo "ArqVertice - Converter Materiais Corona para PBR" on
      (
        local targetObjs = getTargetNodes()
        local convertedCount = 0
        local total = amax #(targetObjs.count, 1)

        for i = 1 to targetObjs.count do
        (
          local obj = targetObjs[i]
          pbProgress.value = (i * 100.0 / total) as integer

          if obj.material != undefined do
          (
            local hadEmissive = isEmissiveMaterial obj.material
            obj.material = convertSingleMaterialToPBR obj.material
            convertedCount += 1

            -- Se o material possuía emissão, garante também o prefixo LIGHT_ na malha
            if hadEmissive do
            (
              local upperName = toUpper obj.name
              if not (matchPattern upperName pattern:"LIGHT_*") and not (matchPattern upperName pattern:"EMISSIVE_*") do
                obj.name = "LIGHT_" + obj.name
            )
          )
        )

        pbProgress.value = 100
        lblStatus.text = ("Etapa 2 concluída: Materiais Corona convertidos para Physical Material (glTF PBR) em " + (convertedCount as string) + " objeto(s).")
      )
    )

    -- BOTÃO 3: Limpar Cena e Resetar Transformações
    on btnStep3 pressed do
    (
      undo "ArqVertice - Limpar Cena e Reset XForm" on
      (
        local allObjs = getTargetNodes()
        local removedCount = 0
        local resetCount = 0

        -- 1. Remove helpers, dummies, câmeras/luzes de renderização e objetos ocultos
        for i = allObjs.count to 1 by -1 do
        (
          local obj = allObjs[i]
          if isValidNode obj do
          (
            local superCls = superClassOf obj
            local shouldDelete = false

            if superCls == helper or superCls == camera or superCls == light do
              shouldDelete = true

            if chkRemoveHidden.checked and obj.isHidden do
              shouldDelete = true

            if shouldDelete do
            (
              try(delete obj; removedCount += 1) catch()
            )
          )
        )

        -- 2. Desvincula hierarquias complexas, aplica Reset XForm e colapsa para Editable Poly
        local geomObjs = for o in (getTargetNodes()) where (isValidNode o and superClassOf o == GeometryClass) collect o
        local total = amax #(geomObjs.count, 1)

        for i = 1 to geomObjs.count do
        (
          local obj = geomObjs[i]
          pbProgress.value = (i * 100.0 / total) as integer

          if isValidNode obj and (canConvertTo obj Editable_Poly) do
          (
            try
            (
              -- Remove vínculo pai caso tenha escala não-uniforme herdada
              if obj.parent != undefined do obj.parent = undefined

              -- Adiciona coordenadas UVW padrão caso a malha não possua mapeamento
              if (classOf obj) != Editable_Poly do convertToPoly obj

              resetXForm obj
              collapseStack obj
              convertToPoly obj
              resetCount += 1
            )
            catch()
          )
        )

        pbProgress.value = 100
        lblStatus.text = ("Etapa 3 concluída: " + (removedCount as string) + " objeto(s) auxiliar(es)/oculto(s) removido(s) e Reset XForm aplicado em " + (resetCount as string) + " malha(s).")
      )
    )

    -- BOTÃO 4: Exportar GLB Otimizado para Web
    on btnStep4 pressed do
    (
      local outDir = trimRight edtExportPath.text "\\/"
      if outDir == "" do
      (
        messageBox "Selecione a pasta /public/models/ do projeto Next.js antes de exportar." title:"ArqVértice Exporter"
        return false
      )

      -- Garante que o diretório de destino exista
      makeDir outDir all:true

      local outFileName = if ddlFileName.selection == 1 then "residencia-raw.glb" else "residencia.glb"
      local fullOutPath = outDir + "\\" + outFileName
      local exportSelectedOnly = (rdoScope.state == 2 and selection.count > 0)

      pbProgress.value = 35
      lblStatus.text = ("Exportando arquivo GLB para:\n" + fullOutPath + " ...")

      local exportSuccess = false
      try
      (
        exportSuccess = exportFile fullOutPath #noPrompt selectedOnly:exportSelectedOnly
      )
      catch
      (
        exportSuccess = false
      )

      if exportSuccess then
      (
        pbProgress.value = 80

        -- Caso a opção de rodar o otimizador Node.js (@gltf-transform Draco) esteja marcada
        if chkRunNodeOptimizer.checked and ddlFileName.selection == 1 do
        (
          -- Sobe duas pastas a partir de /public/models para encontrar a raiz do projeto Next.js
          local projectRoot = pathConfig.removePathLeaf (pathConfig.removePathLeaf outDir)
          local packageJsonFile = projectRoot + "\\package.json"

          if doesFileExist packageJsonFile do
          (
            lblStatus.text = "Executando 'npm run optimize:3d' (Compressão Draco + Instancing)..."
            local cmd = "cmd.exe /c \"cd /d \"" + projectRoot + "\" && npm run optimize:3d\""
            HiddenDOSCommand cmd startpath:projectRoot donotwait:false
          )
        )

        pbProgress.value = 100
        lblStatus.text = ("Exportação concluída com sucesso!\nArquivo salvo em: " + fullOutPath)
        messageBox ("Exportação GLB concluída com sucesso!\n\nDestino:\n" + fullOutPath) title:"ArqVértice - Web 3D Exporter"
      )
      else
      (
        pbProgress.value = 0
        lblStatus.text = "Erro ao exportar .glb. Verifique se o plugin glTF Exporter do 3ds Max (2023+ ou Babylon Exporter) está ativo."
        messageBox "Não foi possível exportar diretamente para .glb.\nCertifique-se de utilizar o 3ds Max 2023+ (com glTF Exporter nativo) ou o plugin Babylon.js glTF Exporter instalado." title:"Erro na Exportação GLB"
      )
    )
  )

  createDialog ::ro_ArqVerticeWebExporter style:#(#style_titlebar, #style_sysmenu, #style_minimizebox)
)
