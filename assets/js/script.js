const keysInfoSort = () => ['name', 'connections', 'publisher', 'occupation', 'first-appearance', 'height', 'weight', 'aliases']

const inputSearchDefault = () => $("#search").val('').focus()

const notFound = () => newTag('h3', { text: 'SuperHero No Encontrado, intente con otro número.', class: 'text-center mb-5 fw-normal fs-2' })

const loading = () => {
    const submit = $('#btn-search').attr("disabled", 'disabled').text('Buscando...')
    const spinner = $(`<span>`, { id: 'loading', class: "spinner-border spinner-border-sm me-2", role: "status" })
    submit.prepend(spinner)
}

const loadingOk = () => { $('#loading').remove(); $('#btn-search').removeAttr('disabled').text('Buscar') }

const translate = text => ({
    name: 'nombre',
    connections: 'conexiones',
    publisher: 'publicado por',
    occupation: 'ocupación',
    'first-appearance': 'primera aparición',
    height: 'altura',
    weight: 'peso',
    aliases: 'alianzas'
}[text])

const parsePowerStats = obj => {
    const arr = Object.entries(obj)
    if (arr.some(item => item[1] != 'null')) return arr.map(arr => ({ label: arr[0], y: arr[1] == 'null' ? null : arr[1] }))
}

const character = response => ({
    id: response.id,
    image: response.image.url,
    name: response.name,
    connections: response.connections['group-affiliation'],
    publisher: response.biography.publisher,
    occupation: response.work.occupation,
    'first-appearance': response.biography['first-appearance'],
    height: `${response.appearance.height[0]} - ${response.appearance.height[1]}`,
    weight: `${response.appearance.weight[0]} - ${response.appearance.weight[1]}`,
    aliases: response.biography.aliases.join(', '),
    powerstats: parsePowerStats(response.powerstats)
})

const newTag = (tag, attr = {}, padre = $('main')) => {
    const element = $(`<${tag}>`, attr); padre.append(element); return element
}

const attrContentCard = (key, value) => {
    const border = keysInfoSort().slice(0, 3).some(keyInfo => keyInfo == key)
    return key == 'image' ? {
        src: value, class: 'mg-fluid rounded-start w-100'
    } : {
        html: `<em class="text-capitalize ">${translate(key)}:</em> ${/^-/.test(value) ? 'Información desconocida' : value}`,
        class: `card-text ${border ? 'py-1' : 'border-top py-4 ps-4 my-0'}`
    }
}

const createCard = character => {
    const section = newTag('section', { class: 'container', id: 'superHeroInfo' })
    const card = newTag('article', { class: 'card' }, section)
    const row = newTag('div', { class: 'row g-0' }, card)
    const col1 = newTag('div', { class: 'col-md-5' }, row)
    newTag('img', attrContentCard('image', character['image']), col1)
    const col2 = newTag('div', { class: 'col-md-7' }, row)
    const cardBody = newTag('div', { class: 'card-body' }, col2)
    keysInfoSort().forEach(key => newTag(`${key == 'name' ? 'h2' : 'p'}`, attrContentCard(key, character[key]), cardBody));
}

const renderPizza = (idTag, character) => {
    new CanvasJS.Chart(
        idTag,
        {
            animationEnabled: true,
            title: { text: `Estadísticas de poder para ${character.name}` },
            data: [{
                type: "pie",
                startAngle: 45,
                showInLegend: "true",
                legendText: "{label}",
                indexLabelFontSize: 16,
                indexLabelFormatter: e => `${e.dataPoint.label} (${e.dataPoint.y || 'Información desconocida'})`,
                dataPoints: character.powerstats
            }]
        }
    ).render()
}

const pizza = character => {
    if (!character.powerstats) { newTag('p', { text: 'Gráfico no disponible =(', class: 'fs-1 text-center py-5' }); return }
    const idTag = 'superHeroPizza'
    newTag('section', { id: idTag, style: "height: 500px; width: 100%;", class: 'my-5' })
    renderPizza(idTag, character)
}

const main = character => {
    newTag('h3', { text: 'SuperHero Encontrado', class: 'text-center mb-5 fw-normal fs-2' })
    createCard(character); pizza(character)
}

const getCharacterById = id => {
    $.ajax({
        type: 'GET',
        url: `https://www.superheroapi.com/api.php/1501982276808516/${id}`,
        beforeSend: () => loading(),
        success: response => { response.response == 'success' ? main(character(response)) : notFound(); loadingOk() },
        error: error => alert('Servicio no disponible\n', error),
    })
}

const search = input => {
    $('main').empty()
    getCharacterById(input)
    $('#formSearch').removeClass('was-validated')
}

const isInputValid = input => /^[1-9]\d{0,2}$/.test(input)

$(function () {
    inputSearchDefault()

    $('#search').on('input', function () {
        $('#formSearch').addClass('was-validated')
        if (isInputValid($(this).val())) { $('#btn-search').removeAttr('disabled'); return }
        $('#btn-search').attr('disabled', 'disabled')
    })

    $('#formSearch').submit(event => {
        event.preventDefault()
        const input = $('#search').val()
        if (!isInputValid(input)) return;
        search(input)
        inputSearchDefault()
    })
})