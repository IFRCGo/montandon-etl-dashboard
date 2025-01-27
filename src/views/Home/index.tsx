import styles from './index.module.css';

interface Props {
    // FIXME: remove this issue with prop types
    name?: string;
}

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component(props: Props) {
    const {
        name = 'Montandon',
    } = props;

    return (
        <div className={styles.home}>
            This is the
            &thinsp;
            {name}
            &thinsp;
            ETL Dashboard
        </div>
    );
}

Component.displayName = 'Home';
