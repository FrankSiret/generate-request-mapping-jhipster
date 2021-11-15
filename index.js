var fs = require('fs');
var endpointFiles = require('./endpoints.json')

const save = (file, text) => {
    fs.writeFile("generated/" + file, text, "utf8", function (error, data) {
        console.log(`Write error [${file}]`);
        if (error) {
            console.log(error);
            console.log(data);
        }
    });
}

const firstLower = (s) => {
    return s[0].toLowerCase() + s.slice(1);
}

const firstUpper = (s) => {
    return s[0].toUpperCase() + s.slice(1);
}

const lowDash = (s = '') => {
    let res = s.charAt(0).toLowerCase();
    for (let i = 1; i < s.length; i++) {
        if (s.charAt(i) >= 'A' && s.charAt(i) <= 'Z')
            res += "_" + s.charAt(i).toLowerCase();
        else res += s.charAt(i);
    }
    return res;
}

/// Main

Object.keys(endpointFiles).forEach(eje => {
    // console.log(eje);
    // console.log(endpointFiles[eje].route);
    const route = endpointFiles[eje].route;
    let allget = '';
    let allgetquery = '';
    let allput = '';
    let allputquery = '';
    let alldelete = '';
    let alldeletequery = '';
    Object.keys(endpointFiles[eje]).filter(v => v != "route").forEach(ejerel => {
        // console.log(ejerel);
        // console.log(endpointFiles[eje][ejerel]);
        const rel = endpointFiles[eje][ejerel].rel;
        const method = endpointFiles[eje][ejerel].method;
        const [from, to] = rel.split(' to ');

        const key = from.startsWith(eje) ? from.split('{')[1].split('}')[0] : to.split('{')[1].split('}')[0];
        const pkey = from.startsWith(ejerel) ? from.split('{')[1].split('}')[0] : to.split('{')[1].split('}')[0];

        const keyfrom = from.split('{')[1].split('}')[0];
        const ejefrom = from.split('{')[0];

        const keyto = to.split('{')[1].split('}')[0];
        const ejeto = to.split('{')[0];

        // console.log({ route, eje, key, ejerel, pkey });

        if (method.indexOf("get") >= 0) {
            /// GET
            const getText =
                `\t/**\n` +
                `\t * {@code GET  /${route}/:id/${key}s} : get all ${firstLower(ejerel)} related to the "id" ${firstLower(eje)}.\n` +
                `\t *\n` +
                `\t * @param id the id of the ${firstLower(eje)} to retrieve.\n` +
                `\t * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the ${firstLower(eje)}, or with status {@code 404 (Not Found)}.\n` +
                `\t */\n` +
                `\t@GetMapping("/${route}/{id}/${key}s")\n` +
                `\tpublic ResponseEntity<${eje}> get${eje}${firstUpper(key)}(@PathVariable UUID id) {\n` +
                `\t    log.debug("REST request to get get${eje}${firstUpper(key)} : {}", id);\n` +
                `\t    Optional<${eje}> ${firstLower(eje)} = ${firstLower(eje)}Repository.findOneWithEagerRelationships${firstUpper(key)}(id);\n` +
                `\t    return ResponseUtil.wrapOrNotFound(${firstLower(eje)});\n` +
                `\t}\n`;
            allget += getText + '\n';

            const getRelationsText =
                `\t@Query("select ${firstLower(eje)} from ${eje} ${firstLower(eje)} left join fetch ${firstLower(eje)}.${key}s where ${firstLower(eje)}.id =:id")\n` +
                `\tOptional<${eje}> findOneWithEagerRelationships${firstUpper(key)}(@Param("id") UUID id);\n`
            allgetquery += getRelationsText + '\n';
        }

        if (method.indexOf("put") >= 0) {
            /// PUT
            const putText =
                `\t/**\n` +
                `\t * {@code PUT  /${route}/:id/${key}s} : add relationship "id" ${firstLower(eje)} and ${firstLower(ejerel)}.\n` +
                `\t *\n` +
                `\t * @param id the id of the ${firstLower(eje)}.\n` +
                `\t * @param ${key} the ${firstLower(ejerel)}.\n` +
                `\t * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body of ${firstLower(eje)}, or with status\n` +
                `\t *         {@code 400 (Bad Request)} if the ${firstLower(ejerel)} is not valid.\n` +
                `\t * @throws URISyntaxException if the Location URI syntax is incorrect.\n` +
                `\t */\n` +
                `\t@PutMapping("/${route}/{id}/${key}s")\n` +
                `\tpublic ResponseEntity<${eje}> createRelation${eje}${firstUpper(key)}(\n` +
                `\t    @PathVariable(value = "id", required = true) final UUID id,\n` +
                `\t    @RequestBody ${ejerel} ${key}\n` +
                `\t) throws URISyntaxException {\n` +
                `\t    log.debug("REST request to create relationship createRelation${eje}${firstUpper(key)} : {}, {}", id, ${key});\n` +
                `\t    if (id == null) {\n` +
                `\t        throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");\n` +
                `\t    }\n` +
                `\t\n` +
                `\t    if (!${firstLower(eje)}Repository.existsById(id)) {\n` +
                `\t        throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");\n` +
                `\t    }\n` +
                `\t\n` +
                `\t    try {\n` +
                `\t        ${firstLower(eje)}Repository.createRelation${eje}${firstUpper(key)}(id, ${key}.getId());\n` +
                `\t    } catch(Exception e) {\n` +
                `\t        throw new BadRequestAlertException("Error al crear la relación", ENTITY_NAME, "createrelationship");\n` +
                `\t    }\n` +
                `\t\n` +
                `\t    Optional<${eje}> r = ${firstLower(eje)}Repository.findOneWithEagerRelationships${firstUpper(key)}(id);\n` +
                `\t    return ResponseUtil.wrapOrNotFound(\n` +
                `\t        r,\n` +
                `\t        HeaderUtil.createAlert(applicationName, "La relación ${firstLower(eje)}-${firstLower(ejerel)} ha sido creada con los identificadores " + id + "-" + ${key}.getId(), id.toString() + "-" + ${key}.getId().toString())\n` +
                `\t    );\n` +
                `\t}\n`;
            // console.log(putText)
            allput += putText + '\n';

            const fid = `:id`;
            const tid = `:${key}Id`;
            let putparam = `${fid}, ${tid}`;
            if (ejefrom === eje) putparam = `${tid}, ${fid}`;

            const putRelationsText =
                `\t@Modifying\n` +
                `\t@Transactional\n` +
                `\t@Query(value = "insert into rel_${lowDash(ejefrom)}__${keyfrom} (${keyfrom}_id, ${lowDash(ejefrom)}_id) values (${putparam})", nativeQuery = true)\n` +
                `\tint createRelation${eje}${firstUpper(key)}(@Param("id") UUID id, @Param("${key}Id") UUID ${key}Id);\n`;

            allputquery += putRelationsText + '\n';
        }

        if (method.indexOf("delete") >= 0) {
            /// DELETE
            const deleteText =
                `\t/**\n` +
                `\t * {@code DELETE  /${route}/:id/${key}s/:${key}Id} : delete the relationship "id" ${firstLower(eje)} and "${key}Id" ${firstLower(ejerel)}.\n` +
                `\t *\n` +
                `\t * @param id the id of the ${firstLower(eje)}.\n` +
                `\t * @param ${key}Id the id of the ${firstLower(ejerel)}.\n` +
                `\t * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}, or with status {@code 400 (Bad Request)}.\n` +
                `\t * @throws URISyntaxException if the Location URI syntax is incorrect.\n` +
                `\t */\n` +
                `\t@DeleteMapping("/${route}/{id}/${key}s/{${key}Id}")\n` +
                `\tpublic ResponseEntity<${eje}> deleteRelation${eje}${firstUpper(key)}(\n` +
                `\t    @PathVariable(value = "id", required = true) final UUID id, \n` +
                `\t    @PathVariable(value = "${key}Id", required = true) final UUID ${key}Id\n` +
                `\t) throws URISyntaxException {\n` +
                `\t    log.debug("REST request to delete relationship deleteRelation${eje}${firstUpper(key)}: {}, {}", id, ${key}Id);\n` +
                `\t    int rows = 0;\n` +
                `\t    try {\n` +
                `\t        rows = ${firstLower(eje)}Repository.deleteRelation${eje}${firstUpper(key)}(id, ${key}Id);\n` +
                `\t    } catch (Exception e) {\n` +
                `\t        throw new BadRequestAlertException("Error al eliminar la relación", ENTITY_NAME, "deleterelationship");\n` +
                `\t    }\n` +
                `\t    if(rows == 0) {\n` +
                `\t        throw new BadRequestAlertException("La relación no existe", ENTITY_NAME, "norelationship");\n` +
                `\t    }\n` +
                `\t\n` +
                `\t    Optional<${eje}> r = ${firstLower(eje)}Repository.findOneWithEagerRelationships${firstUpper(key)}(id);\n` +
                `\t    return ResponseUtil.wrapOrNotFound(\n` +
                `\t        r, \n` +
                `\t        HeaderUtil.createAlert(applicationName, "La relación ${firstLower(eje)}-${firstLower(ejerel)} ha sido eliminada con los identificadores " + id + "-" + ${key}Id, id.toString() + "-" + ${key}Id.toString())\n` +
                `\t    );\n` +
                `\t}\n`;
            // console.log(deleteText)
            alldelete += deleteText + '\n';

            let fid = `:id`;
            let tid = `:${key}Id`;
            if (ejefrom === eje) {
                const temp = tid;
                tid = fid;
                fid = temp;
            }

            const deleteRelationsText =
                `\t@Modifying\n` +
                `\t@Transactional\n` +
                `\t@Query(value = "delete from rel_${lowDash(ejefrom)}__${keyfrom} where ${keyfrom}_id =${fid} and ${lowDash(ejefrom)}_id =${tid}", nativeQuery = true)\n` +
                `\tint deleteRelation${eje}${firstUpper(key)}(@Param("id") UUID id, @Param("${key}Id") UUID ${key}Id);\n`;

            alldeletequery += deleteRelationsText + '\n';
        }
    })

    const requests =
        "/// GET MAPPING FOR RELATIONSHIP\n\n" +
        allget + '\n' +
        "\t/// PUT MAPPING FOR RELATIONSHIP\n\n" +
        allput + '\n' +
        "\t/// DELETE MAPPING FOR RELATIONSHIP\n\n" +
        alldelete;

    const queries =
        "/// GET MAPPING FOR RELATIONSHIP\n\n" +
        allgetquery + '\n' +
        "\t/// PUT MAPPING FOR RELATIONSHIP\n\n" +
        allputquery + '\n' +
        "\t/// DELETE MAPPING FOR RELATIONSHIP\n\n" +
        alldeletequery;

    save(eje + '.txt', requests);
    save(eje + 'Repository.txt', queries);
})