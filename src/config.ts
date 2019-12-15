interface IVisibilityCondition {
    /**
     * ID поля, значение которого будет сравниваться
     */
    id: string;
    /**
     * Значение, при котором будет отображаться блок
     */
    value: string;
}

interface IKonstructCommonBlock {
    /**
     * Уникальный идентификатор блока
     */
    id: string;
    /**
     * Тип блока
     */
    type: string;
    /**
     * Заголовок блока  
     * Отображается в теге h2  
     * Можно использовать html разметку  
     */
    title: string;
    /**
     * Описание блока  
     * Отображается после заголовка в теге p  
     * Можно использовать html разметку
     */
    description: string;
    /**
     * Условия, при выполнении которых блок будет отображаться
     */
    conditions?: IVisibilityCondition[];
}

interface IKonstructSelectBlock extends IKonstructCommonBlock {
    /**
     * Блок выбора из нескольких вариантов
     */
    type: 'select';
    /**
     * Список вариантов для выбора
     */
    values: Array<{
        /**
         * Текст, который будет отображаться в блоке варианта  
         * Если не указан, то будет использоваться значение  
         * Можно использовать html разметку  
         */
        text?: string;
        /**
         * Значение, которое будет присвоено блоку при выборе этого варианта  
         * Можно использовать html разметку  
         */
        value: string | number;
        /**
         * Изображение, которое будет выведено в блоке при выборе варианта  
         * Если не указано, то изображения не будет  
         * 
         * Поддерживаются значения из других блоков  
         * Например если необходимо использовать значение блока c id type,  
         * то внутри пути к изобраению можно использовать переменную `{type}` вот так:  
         * `/path/to/my/img/picture_{type}.jpg`  
         * Тогда при значении type=main путь будет `/path/to/my/img/picture_main.jpg`
         */
        img?: string;
    }>
}

interface IKonstructImageBlock extends IKonstructCommonBlock {
    /**
     * Блок изображения
     */
    type: 'image';
    /**
     * Изображение, которое будет выведено в блоке при выборе варианта  
     * Если не указано, то изображения не будет  
     * 
     * Поддерживаются значения из других блоков  
     * Например если необходимо использовать значение блока c id type,  
     * то внутри пути к изобраению можно использовать переменную `{type}` вот так:  
     * `/path/to/my/img/picture_{type}.jpg`  
     * Тогда при значении type=main путь будет `/path/to/my/img/picture_main.jpg`
     */
    img: string;
    /**
     * HTML атрибуты изображения (alt, etc.)
     */
    attributes?: Partial<HTMLImageElement>;
}

interface IKonstructFieldsBlock extends IKonstructCommonBlock {
    /**
     * Блок полей ввода
     */
    type: 'fields';
    /**
     * Атрибуты полей
     */
    fields: Array<{
        /**
         * Уникальный идентификатор поля
         */
        id: string;
        /**
         * Заголовок поля  
         * Отображается в теге label  
         * Можно использовать html разметку  
         */
        title: string;
        /**
         * HTML атрибуты поля ввода (placeholder, autocomplete, etc.)
         */
        attributes?: Partial<HTMLInputElement>;
    }>;
}

interface IDebugOptions {
    /**
     * Логгировать ли в консоль каждое обновление значений
     */
    logUpdates?: true;
    /**
     * Использовать ли вместо изображений заглушки
     */
    placeholdImages?: true;
}

/**
 * Настройки плагина
 */
interface IConfig {
    /**
     * Значение атрибута action тега form
     */
    action: string;
    /**
     * Колбек, который будет выполняться при отправке формы  
     * Если он объявлен, то стандартная отправка формы производиться не будет
     */
    onSubmit?: (values: Record<string, string>) => void;
    /**
     * Текст кнопки сохранения
     */
    saveButtonText: string;
    /**
     * Определения блоков
     */
    blocks: Array<IKonstructSelectBlock | IKonstructFieldsBlock | IKonstructImageBlock>;
    /**
     * Опции для отладки
     */
    debug: IDebugOptions;
}

const config: IConfig = {
    action: '/send',
    saveButtonText: 'Save',
    onSubmit: console.log,
    blocks: [{
        id: 'type',
        type: 'select',
        title: 'Выберите тип',
        description: 'Lorem ipsum dolor sit amet.',
        values: [{
            value: 'al',
            text: 'Алюминиевые',
            img: 'al'
        }, {
            value: 'raz',
            text: 'Раздвижные',
            img: 'raz'
        }, {
            value: 'cs',
            text: 'Цельностеклянные',
            img: 'cs'
        }, {
            value: 'af',
            text: 'Противопожарные',
            img: 'af'
        }]
    }, {
        id: 'size',
        type: 'select',
        title: 'Выберите размер',
        description: 'Lorem ipsum dolor sit amet.',
        values: [{
            value: 's',
            text: 'Маленький',
            img: 's{type}'
        }, {
            value: 'm',
            text: 'Средний',
            img: 'm'
        }, {
            value: 'l',
            text: 'Большой',
            img: 'l'
        }, {
            value: 'xz',
            text: 'Непонятный',
            img: 'xz'
        }]
    }, {
        id: 'def',
        type: 'select',
        title: 'Выберите степень защиты',
        description: 'Lorem ipsum dolor sit amet.',
        conditions: [{
            id: 'type',
            value: 'af'
        }],
        values: [{
            value: 15,
        }, {
            value: 30,
        }, {
            value: 45,
        }, {
            value: 60,
        }]
    }, {
        id: 'contacts',
        type: 'fields',
        title: 'Контакты',
        description: 'Lorem ipsum dolor sit amet.',
        fields: [{
            id: 'name',
            title: 'Имя',
            attributes: {
                type: 'text',
                placeholder: 'Ваня',
                required: true
            }
        }]
    }, {
        id: 'image',
        type: 'image',
        img: 's{type}_{fields.name}',
        title: '',
        description: '',
    }],
    debug: {
        logUpdates: true,
        placeholdImages: true,
    }
};
