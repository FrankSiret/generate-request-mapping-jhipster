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

/// Main

Object.keys(endpointFiles).forEach(eje => {
    // console.log(eje);
    // console.log(endpointFiles[eje].route);
    const route = endpointFiles[eje].route;
    let allget = '';
    let allgetrelations = '';
    Object.keys(endpointFiles[eje]).filter(v => v != "route").forEach(ejerel => {
        // console.log(ejerel);
        // console.log(endpointFiles[eje][ejerel]);
        const rel = endpointFiles[eje][ejerel].rel;
        const method = endpointFiles[eje][ejerel].method;
        const [from, to] = rel.split(' to ');
        const key = from.startsWith(eje) ? from.split('{')[1].split('}')[0] : to.split('{')[1].split('}')[0];
        const pkey = from.startsWith(ejerel) ? from.split('{')[1].split('}')[0] : to.split('{')[1].split('}')[0];
        // console.log({ route, eje, key, ejerel, pkey });
        /// GET
        const getmapping = "@GetMapping";

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
        // console.log(getText)
        allget += getText + '\n';

        const getRelationsText =
            `\t@Query("select ${firstLower(eje)} from ${eje} ${firstLower(eje)} left join fetch ${firstLower(eje)}.${key}s where ${firstLower(eje)}.id =:id")\n` +
            `\tOptional<${eje}> findOneWithEagerRelationships${firstUpper(key)}(@Param("id") Long id);\n`

        allgetrelations += getRelationsText + '\n';
    })
    save(eje + '.txt', allget);
    save(eje + 'Repository.txt', allgetrelations);
})